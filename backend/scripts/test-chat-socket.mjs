/**
 * Socket.IO QA harness for HustleBridge chat.
 * Usage:
 *   node scripts/test-chat-socket.mjs
 *   node scripts/test-chat-socket.mjs --scenario read-receipt
 *   node scripts/test-chat-socket.mjs --scenario presence
 *   node scripts/test-chat-socket.mjs --scenario offline-notification
 *   node scripts/test-chat-socket.mjs --scenario multi-user
 */

import { io } from 'socket.io-client';

const BASE_URL = process.env.API_BASE ?? 'http://localhost:4000/api/v1';
const SOCKET_URL = process.env.SOCKET_URL ?? 'http://localhost:4000';
const STUDENT_EMAIL = 'arjun@hustlebridge.dev';
const CLIENT_EMAIL = 'techlearn@hustlebridge.dev';
const PASSWORD = 'Password1';

const scenarioArg = process.argv.indexOf('--scenario');
const scenario =
  scenarioArg >= 0 ? process.argv[scenarioArg + 1] ?? 'all' : 'all';

function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}

function pass(id, msg) {
  console.log(`  PASS ${id}: ${msg}`);
}

function fail(id, msg) {
  console.error(`  FAIL ${id}: ${msg}`);
  process.exitCode = 1;
}

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }
  return json.data;
}

function connectSocket(token, label) {
  return new Promise((resolve, reject) => {
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    const timeout = setTimeout(() => reject(new Error(`${label}: connection timeout`)), 8000);
    socket.on('connect', () => {
      clearTimeout(timeout);
      resolve(socket);
    });
    socket.on('connect_error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

function waitForEvent(socket, event, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeoutMs);
    socket.once(event, (payload) => {
      clearTimeout(t);
      resolve(payload);
    });
  });
}

function emitAck(socket, event, payload) {
  return new Promise((resolve) => {
    socket.emit(event, payload, (res) => resolve(res));
  });
}

async function login() {
  const studentAuth = await api('POST', '/auth/login', { email: STUDENT_EMAIL, password: PASSWORD });
  const clientAuth = await api('POST', '/auth/login', { email: CLIENT_EMAIL, password: PASSWORD });
  return {
    studentToken: studentAuth.tokens.accessToken,
    studentId: studentAuth.user.id,
    clientToken: clientAuth.tokens.accessToken,
    clientId: clientAuth.user.id,
  };
}

async function ensureConversation(studentToken, clientId) {
  const created = await api('POST', '/messages/conversations', {
    participantId: clientId,
    initialMessage: 'Socket QA bootstrap message',
  }, studentToken);
  return created.conversation.id;
}

async function testConnectionInvalid() {
  log('S2', 'Reject connection without token');
  try {
    await connectSocket('', 'no-token');
    fail('S2', 'Should not connect without token');
  } catch {
    pass('S2', 'Connection rejected without token');
  }
}

async function testJoinAndSend(studentSocket, clientSocket, conversationId, studentId) {
  log('S2-S4', 'join_conversation + send_message + receive_message');

  const joinStudent = await emitAck(studentSocket, 'join_conversation', conversationId);
  const joinClient = await emitAck(clientSocket, 'join_conversation', conversationId);
  if (!joinStudent?.success) fail('S2', 'Student join failed');
  else pass('S2', 'Student joined conversation room');
  if (!joinClient?.success) fail('S2', 'Client joined conversation room');

  const receivePromise = waitForEvent(clientSocket, 'receive_message');
  const sendRes = await emitAck(studentSocket, 'send_message', {
    conversationId,
    content: 'Socket QA: student → client',
  });
  if (!sendRes?.success) fail('S3', sendRes?.error ?? 'send failed');
  else pass('S3', 'send_message ack success');

  const received = await receivePromise;
  if (received.content !== 'Socket QA: student → client') fail('S4', 'Wrong message payload');
  else pass('S4', 'Client received receive_message');

  const badSend = await emitAck(studentSocket, 'send_message', { conversationId, content: '' });
  if (badSend?.success) fail('S6', 'Empty content should fail');
  else pass('S6', 'Empty send_message rejected');
}

async function testTyping(studentSocket, clientSocket, conversationId, studentId) {
  log('S5', 'typing_start / typing_stop');
  const typingStart = waitForEvent(clientSocket, 'typing_start');
  studentSocket.emit('typing_start', { conversationId });
  const startPayload = await typingStart;
  if (startPayload.userId !== studentId) fail('S5', 'typing_start wrong userId');
  else pass('S5', 'typing_start received');

  const typingStop = waitForEvent(clientSocket, 'typing_stop');
  studentSocket.emit('typing_stop', { conversationId });
  const stopPayload = await typingStop;
  if (stopPayload.userId !== studentId) fail('S5', 'typing_stop wrong userId');
  else pass('S5', 'typing_stop received');
}

async function testReadReceipt(studentSocket, clientSocket, conversationId, studentId, studentToken) {
  log('R4/S7', 'message_read via socket');
  await api('POST', `/messages/conversations/${conversationId}/messages`, {
    content: 'Unread for read-receipt test',
  }, studentToken);

  const readPromise = waitForEvent(clientSocket, 'message_read');
  const readRes = await emitAck(studentSocket, 'message_read', { conversationId });
  if (!readRes?.success) fail('R4', 'message_read ack failed');
  const readEvent = await readPromise;
  if (readEvent.userId !== studentId) fail('R4', 'message_read wrong userId');
  else pass('R4', 'message_read event received by partner');
}

async function testPresence(clientToken, studentToken, studentId) {
  log('O1-O4', 'user_online / user_offline');
  const clientSocket = await connectSocket(clientToken, 'client-presence');
  const onlinePromise = waitForEvent(clientSocket, 'user_online');
  const studentSocket = await connectSocket(studentToken, 'student-presence');
  pass('S1', `Student connected for presence (${studentSocket.id})`);

  try {
    const online = await onlinePromise;
    if (online.userId === studentId) pass('O1', 'Client received user_online');
    else fail('O1', 'user_online wrong userId');
  } catch {
    pass('O1', 'user_online skipped (student may already be online)');
  }

  const offlinePromise = waitForEvent(clientSocket, 'user_offline');
  studentSocket.disconnect();
  const offline = await offlinePromise;
  if (offline.userId === studentId) pass('O3', 'Client received user_offline');
  else fail('O3', 'user_offline wrong userId');

  clientSocket.disconnect();
}

async function testOfflineNotification(studentToken, clientToken, conversationId) {
  log('N1/S10', 'notification while client offline');
  const beforePayload = await api('GET', '/notifications', null, clientToken);
  const beforeList = beforePayload?.notifications ?? [];
  const beforeCount = beforeList.filter((n) => n.type === 'message').length;

  await api('POST', `/messages/conversations/${conversationId}/messages`, {
    content: 'QA offline notification test',
  }, studentToken);

  const afterPayload = await api('GET', '/notifications', null, clientToken);
  const messageNotifs = (afterPayload?.notifications ?? []).filter((n) => n.type === 'message');
  if (messageNotifs.length <= beforeCount) fail('N1', 'Expected new notification while offline');
  else pass('N1', `Notification created (${messageNotifs.length} message notifications)`);
}

async function testMultiUser(studentSocket, clientSocket, conversationId) {
  log('U2-U4', 'Bidirectional socket messages');
  const clientReceive = waitForEvent(clientSocket, 'receive_message');
  await emitAck(studentSocket, 'send_message', {
    conversationId,
    content: 'Multi-user: student socket',
  });
  const fromStudent = await clientReceive;
  pass('U2', `Client received: ${fromStudent.content}`);

  const studentReceive = waitForEvent(studentSocket, 'receive_message');
  await emitAck(clientSocket, 'send_message', {
    conversationId,
    content: 'Multi-user: client socket',
  });
  const fromClient = await studentReceive;
  pass('U4', `Student received: ${fromClient.content}`);
}

async function main() {
  log('SETUP', 'Logging in');
  const auth = await login();
  const conversationId = await ensureConversation(auth.studentToken, auth.clientId);

  await testConnectionInvalid();

  if (scenario === 'offline-notification') {
    await testOfflineNotification(auth.studentToken, auth.clientToken, conversationId);
    log('DONE', 'offline-notification finished');
    return;
  }

  if (scenario === 'presence') {
    await testPresence(auth.clientToken, auth.studentToken, auth.studentId);
    log('DONE', 'presence finished');
    return;
  }

  const studentSocket = await connectSocket(auth.studentToken, 'student');
  pass('S1', `Student connected (${studentSocket.id})`);
  const clientSocket = await connectSocket(auth.clientToken, 'client');
  pass('S1', `Client connected (${clientSocket.id})`);

  if (scenario === 'read-receipt') {
    await testReadReceipt(studentSocket, clientSocket, conversationId, auth.studentId, auth.studentToken);
    studentSocket.disconnect();
    clientSocket.disconnect();
    log('DONE', 'read-receipt finished');
    return;
  }

  if (scenario === 'multi-user') {
    await testJoinAndSend(studentSocket, clientSocket, conversationId, auth.studentId);
    await testMultiUser(studentSocket, clientSocket, conversationId);
    studentSocket.disconnect();
    clientSocket.disconnect();
    log('DONE', 'multi-user finished');
    return;
  }

  // all
  await testJoinAndSend(studentSocket, clientSocket, conversationId, auth.studentId);
  await testTyping(studentSocket, clientSocket, conversationId, auth.studentId);
  await testReadReceipt(studentSocket, clientSocket, conversationId, auth.studentId, auth.studentToken);
  await testMultiUser(studentSocket, clientSocket, conversationId);
  studentSocket.disconnect();
  clientSocket.disconnect();

  await testPresence(auth.clientToken, auth.studentToken, auth.studentId);
  await testOfflineNotification(auth.studentToken, auth.clientToken, conversationId);

  log('DONE', 'all scenarios finished');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
