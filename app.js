const express = require("express");
const bodyParser = require("body-parser");
const graphqlHttp = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");

const app = express();

// const events = [];

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHttp({
    schema: buildSchema(`
      type Event{
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User{
        _id: ID!
        name: String!
        email: String!
        password: String
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input UserInput {
        name: String!
        email: String!
        password: String
      }

      type RootQuery{
        events: [Event!]!
      }

      type RootMutation{
        createEvent(eventIput: EventInput): Event
        createUser(userInput: UserInput): User
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      events: () => {
        return Event.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc, _id: event.id };
            });
          })
          .catch(err => {
            throw err;
          });
      },
      createEvent: args => {
        // const event = {
        //   _id: Math.random().toString(),
        //   title: args.eventIput.title,
        //   description: args.eventIput.description,
        //   price: +args.eventIput.price,
        //   date: args.eventIput.date
        // };
        const event = new Event({
          title: args.eventIput.title,
          description: args.eventIput.description,
          price: +args.eventIput.price,
          date: new Date(args.eventIput.date),
          creator: "5c19273879c5964e48a3dfce"
        });
        // events.push(event);
        let createdEvent;
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc, _id: event.id };
            return User.findById("5c19273879c5964e48a3dfce");
          })
          .then(user => {
            if (!user) {
              throw new Error("User not found!");
            }
            user.createEvents.push(event);
            return user.save();
          })
          .then(result => {
            return createdEvent;
          })
          .catch(err => {
            throw err;
          });
      },
      createUser: args => {
        return User.findOne({ email: args.userInput.email })
          .then(user => {
            if (user) {
              throw new Error("User exists already");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then(hashedPassword => {
            const user = new User({
              name: args.userInput.name,
              email: args.userInput.email,
              password: hashedPassword
            });
            return user.save();
          })
          .then(result => {
            return { ...result._doc, password: null, _id: result.id };
          })
          .catch(err => {
            throw err;
          });
      }
    },
    graphiql: true
  })
);

app.get("/", (req, res, next) => {
  res.send("Hello Wordl");
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0-bqhq9.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
