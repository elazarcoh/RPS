"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const users_db = admin.firestore().collection('users');
const usernames_db = admin.firestore().collection('usernames');
const games_db = admin.firestore().collection('games');
var GameStatus;
(function (GameStatus) {
    GameStatus[GameStatus["CREATED"] = 0] = "CREATED";
    GameStatus[GameStatus["WAITING"] = 1] = "WAITING";
    GameStatus[GameStatus["READY"] = 2] = "READY";
})(GameStatus || (GameStatus = {}));
exports.createUser = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const username = request.query.name;
    try {
        console.log(`search for user`);
        const snapshot = yield usernames_db.doc(username).get();
        if (snapshot && snapshot.exists) {
            console.log(`user ${username} already exists`);
            response.send(`user ${username} already exists`);
        }
        else {
            console.log(`user dosnt exists, create new user`);
            const newUserRef = users_db.doc();
            const userData = { username: username };
            const user_ref_data = { user_ref: newUserRef.id };
            yield newUserRef.set(userData);
            yield usernames_db.doc(username).set(user_ref_data);
            console.log("user added");
            response.send({
                userdata: userData,
                user_ref: user_ref_data
            });
        }
    }
    catch (err) {
        console.log(err);
        response.status(500).send(`could not create ${username}`);
    }
}));
exports.createGame = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const player1Id = request.query.user;
    try {
        const p1Ref = yield users_db.doc(player1Id).get();
        console.log(`user ${p1Ref.data().username} found`);
        const gameRef = games_db.doc();
        console.log(`game id ${gameRef.id}`);
        const game = {
            status: GameStatus.CREATED,
            player1: p1Ref.id,
            players_count: 1
        };
        yield gameRef.set(game);
        console.log(`new game created: ${gameRef}`);
        response.send(gameRef.id);
    }
    catch (err) {
        console.log(err);
        response.status(500).send(`could not create new game`);
    }
}));
exports.joinGame = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const player2Id = request.query.user;
    const gameId = request.query.game;
    try {
        const p2Snapshot = yield users_db.doc(player2Id).get();
        if (!p2Snapshot.exists) {
            console.log(`user ${player2Id} not exists`);
            response.send(`user ${player2Id} not exists`);
            return;
        }
        const gameSnapshot = yield games_db.doc(gameId).get();
        if (!gameSnapshot.exists) {
            console.log(`game ${gameId} not exists`);
            response.send(`could not join game ${gameId}`);
            return;
        }
        // const gameData = gameSnapshot.data();
        const res = yield join_game(gameSnapshot, p2Snapshot);
        // if (gameData.players_count < 2) {
        //     const game = {
        //         status: gameData.status,
        //         player2: player2Id,
        //         players_count: gameData.players_count + 1
        //     };
        //     if (game.players_count === 2) {
        //         game.status = GameStatus.READY;
        //     }
        //
        //     await games_db.doc(gameId).update(game);
        //
        //     console.log(`game created: ${game}`);
        response.send(res);
    }
    catch (err) {
        console.log(err);
        response.status(500).send(`could not join game ${gameId}`);
    }
}));
exports.findAndJoinGame = functions.https.onRequest((request, response) => __awaiter(this, void 0, void 0, function* () {
    const player2Id = request.query.user;
    try {
        const p2Snapshot = yield users_db.doc(player2Id).get();
        if (!p2Snapshot.exists) {
            console.log(`user ${player2Id} not exists`);
            response.send(`user ${player2Id} not exists`);
            return;
        }
        const gameQuery = yield games_db.where('status', '==', GameStatus.CREATED)
            .limit(1).get();
        if (gameQuery.size < 1) {
            // no game found
            exports.createGame(request, response);
        }
        else {
            // found a game. join it!
            const gameRef = gameQuery[0];
            const res = yield join_game(gameRef, p2Snapshot);
            response.send(res);
        }
    }
    catch (err) {
        console.log(err);
        response.status(500).send(`could not find/create a game for player ${player2Id}`);
    }
}));
function join_game(gameRef, userRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const gameData = gameRef.data();
        if (gameData.players_count < 2) {
            const game = {
                status: gameData.status,
                player2: userRef.id,
                players_count: gameData.players_count + 1
            };
            if (game.players_count === 2) {
                game.status = GameStatus.READY;
            }
            yield games_db.doc(gameRef.id).update(game);
            console.log(`game created: ${game}`);
            return { id: gameRef.id, status: game.status };
        }
        else {
            console.log(`could not join game ${gameRef.id}: full`);
            return `could not join game ${gameRef.id}`;
        }
    });
}
//# sourceMappingURL=index.js.map