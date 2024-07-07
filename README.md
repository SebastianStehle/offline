# Offline Sync

This repository demonstrates offline behavior using event sourcing. the repository demonstrates architectural principles, the tech stack does not matter.

We assume that the backend is only a proxy for an actual backend and deals with offline behavior and to transform requests between the frontend and backend.

## Behavior 
This is how it works in short on the frontend and proxy:

### Frontend Behavior

1. Client creates an event for an update.
2. The state uses timestamps on a per-field level to detect conflicts.
3. Event is used to update local client state, which is persisted to local storage.
4. Event is also pushed to an event queue, which is also persisted to local storage.
5. Event Queue is sent to the server when there is an connection.
6. On application start the state is first queried from the proxy and then from the local storage for offline mode.
7. The client keeps a connection to the proxy using server-sent-events to get new events from other clients. This connection is automatically reopened whenever it gets lost.

### Proxy Behavior

1. The proxy receives events from the clients.
2. Events are used to update local state and to detect local conflicts.
3. Events are also used to update the actual backend (source of truth).
4. Events are forwarded to other clients using server-sent-events.

## Evaluation

### PROS

1. Client get an update from other clients.
2. Events provide meaning and are easy to log.
3. Proxy has a simple API surface, because it only has to deal with events and not with dozens of mutation endpoints.
4. Because we sent events from the proxy to the client we can also send correction events and conflict events to notify the user about these issues.

### CONS

1. Duplicate business logic on server and client (but this cannot really avoided in offline mode).
2. If the actual backend does not provide timestamp, the proxy needs to maintain a copy of all data to detect conflicts (this can also not be avoided).
3. Complex event validation.

## How to run

### Requirements

You need the following tools:

* MongoDB
* Node (for the frontend)
* .NET Core (for the backend)

### How to run

#### Frontend

```
cd frontend
npm i
npm run dev
```

### Proxy

```
cd backend
dotnet run
```
