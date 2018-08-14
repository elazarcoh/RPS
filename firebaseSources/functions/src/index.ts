import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const users_db = admin.firestore().collection('users');
const usernames_db = admin.firestore().collection('usernames');
const games_db = admin.firestore().collection('games');

enum GameStatus {
    CREATED = 0,
    WAITING = 1,
    READY = 2
}


export const createUser = functions.https.onRequest(async (request, response) => {
    const username: string = request.query.name;

    try {
        console.log(`search for user`);

        const snapshot = await usernames_db.doc(username).get();

        if (snapshot && snapshot.exists) {

            console.log(`user ${username} already exists`);
            response.send(`user ${username} already exists`);

        } else {
            console.log(`user dosnt exists, create new user`);

            const newUserRef = users_db.doc();

            const userData = {username: username};
            const user_ref_data = {user_ref: newUserRef.id};

            await newUserRef.set(userData);
            await usernames_db.doc(username).set(user_ref_data);

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
});

export const createGame = functions.https.onRequest(async (request, response) => {
    const player1Id = request.query.user;

    try {
        const p1Ref = await users_db.doc(player1Id).get();

        console.log(`user ${p1Ref.data().username} found`);
        const gameRef = games_db.doc();
        console.log(`game id ${gameRef.id}`);

        const game = {
            status: GameStatus.CREATED,
            player1: p1Ref.id,
            players_count: 1
        };

        await gameRef.set(game);

        console.log(`new game created: ${gameRef}`);
        response.send({id: gameRef.id, status: game.status});
    }
    catch (err) {
        console.log(err);
        response.status(500).send(`could not create new game`);
    }
});

export const joinGame = functions.https.onRequest(async (request, response) => {
    const player2Id = request.query.user;
    const gameId = request.query.game;

    try {
        const p2Snapshot = await users_db.doc(player2Id).get();

        if (!p2Snapshot.exists) {
            console.log(`user ${player2Id} not exists`);
            response.send(`user ${player2Id} not exists`);
            return;
        }

        const gameSnapshot = await games_db.doc(gameId).get();

        if (!gameSnapshot.exists) {
            console.log(`game ${gameId} not exists`);
            response.send(`could not join game ${gameId}`);
            return;
        }

        // const gameData = gameSnapshot.data();

        const res = await join_game(gameSnapshot, p2Snapshot);

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
});



export const findAndJoinGame = functions.https.onRequest(async (request, response) => {

    const player2Id = request.query.user;

    try {
        const p2Snapshot = await users_db.doc(player2Id).get();

        if (!p2Snapshot.exists) {
            console.log(`user ${player2Id} not exists`);
            response.send(`user ${player2Id} not exists`);
            return;
        }
        const gameQuery = await games_db.where('status', '==', GameStatus.CREATED)
            .limit(1).get();

        if (gameQuery.size < 1) {
            // no game found
            createGame(request, response);
        } else {
            // found a game. join it!
            const gameRef = gameQuery.docs[0];
            console.log(`found game, joining...`);
            const res = await join_game(gameRef, p2Snapshot);
            response.send(res);
        }
    }
    catch (err) {
        console.log(err);
        response.status(500).send(`could not find/create a game for player ${player2Id}`);
    }
});

async function join_game(gameRef: FirebaseFirestore.DocumentSnapshot,
                         userRef: FirebaseFirestore.DocumentSnapshot) {
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

        await games_db.doc(gameRef.id).update(game);

        console.log(`game created: ${game}`);
        return {id: gameRef.id, status: game.status};

    } else {
        console.log(`could not join game ${gameRef.id}: full`);
        return `could not join game ${gameRef.id}`;
    }
}