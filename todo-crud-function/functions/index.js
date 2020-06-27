const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
const serviceAccount = require("./permissions.json");

app.use(cors({ origin: true }));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://wigilabs-4246d.firebaseio.com"
});
const db = admin.firestore();
const baseURL = "/api/v1";

// create task
app.post(`${baseURL}/task`, (req, res) => {
    (async () => {
        try {
            const data = req.body;
            const taskRef = await db.collection('task').add(data);
            const createdTask = await taskRef.get();

            res.json({
                id: taskRef.id,
                data: createdTask.data()
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get task by id
app.get(`${baseURL}/task/:id`, (req, res) => {
    (async () => {
        try {
            const taskId = req.params.id;

            if (!taskId) throw new Error('Task ID is required');

            const task = await db.collection('task').doc(taskId).get();

            if (!task.exists) {
                throw new Error('Task doesnt exist.')
            }

            res.json({
                id: task.id,
                data: task.data()
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get task list
app.get(`${baseURL}/task`, (req, res) => {
    (async () => {
        try {
            const taskQuerySnapshot = await db.collection('task').get();
            const tasks = [];
            taskQuerySnapshot.forEach(
                (doc) => {
                    tasks.push({
                        id: doc.id,
                        data: doc.data()
                    });
                }
            );

            res.json(tasks);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// update a task
app.put(`${baseURL}/task/:id`, (req, res) => {
    (async () => {
        try {
            const taskId = req.params.id;
            const data = req.body;

            if (!taskId) throw new Error('id is blank');

            if (!Object.keys(data)) throw new Error('Without data to update');

            const taskRef = await db.collection('task')
                .doc(taskId)
                .set(data, { merge: true });

            res.json({
                id: taskId,
                data
            })
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// delete a task
app.delete(`${baseURL}/task/:id`, (req, res) => {
    (async () => {
        try {
            const taskId = req.params.id;

            if (!taskId) throw new Error('id is blank');

            await db.collection('task')
                .doc(taskId)
                .delete();

            res.json({
                id: taskId,
            })
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

exports.app = functions.https.onRequest(app);