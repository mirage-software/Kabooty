
# Kabooty

Kabooty is the System for the [Endlessmirage](https://endlessmirage.net) collab Project.

## Installation

Clone the Project

```bash
    git clone git@github.com:mirage-software/Kabooty.git
```
Download required Packages and Dependencies
```bash
    npm install
```
### Set up Enviorment Variables  
  
- Setup a new Discord Application [here](https://discord.com/developers/applications)  
- Setup a new osu Application [here](https://osu.ppy.sh/home/account/edit#new-oauth-application).

#### Discord Server

- Create a new Discord Server
- Create a new Group and assign it to urself

### Discord Application

#### Oauth2

Configure the Oauth callback like this: `http://localhost:3000/redirect/discord`

![](https://i.imgur.com/qfMCQ9g.png)

#### Discord Bot

Create a new Discord bot in the Application no further Settings must be changed for this Bot.

Afterwards invite the discord bot into your newly created Server

```bash
https://discord.com/oauth2/authorize?client_id=[DISCORD CLIENT ID HERE]&permision=8&scope=bot%20applications.commands
```

### osu Oauth Application

Create a new Oauth Application like this: `http://localhost:3000/redirect/osu`

![](https://i.imgur.com/a418T9F.png)

### JWT Secret  

JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.  

Generate a new Token for this.

More Info on how to generate a new Token you can find [here](https://www.ssh.com/academy/ssh/keygen)

### Enviroment Variables
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirage?schema=public

DISCORD_CLIENT_ID=[DISCORD CLIENT ID HERE]
DISCORD_CLIENT_SECRET=[DISCORD OAUTH2 SECRET HERE]
DISCORD_REDIRECT_URI=http://localhost:3000/redirect/discord
DISCORD_BOT_TOKEN=[DISCORD BOT TOKE HERE]
DISCORD_SERVER_ID=[ID OF YOUR DISCORD SERVER]
DISCORD_ADMIN_ROLE_ID=[ID OF THE ROLE YOU CREATED ON THIS SERVER]


OSU_CLIENT_ID=[ID OF THE OSU OAUTH APPLICATION]
OSU_CLIENT_SECRET=[SECRET OF THE OSU OAUTH APPLICATION]
OSU_REDIRECT_URI=http://localhost:3000/redirect/osu

JWT_SECRET=[YOUR GENERATE Private Key]

PUBLIC_BASE_URL=http://localhost:3000
```

### Docker

Install Docker from [here](https://www.docker.com/products/docker-desktop/)

#### Docker Compose
Swap into the Kabooty Project Folder and compose the docker project with docker compose
```bash
    docker compose up -d
```

#### Database

Set up the Database for Kabooty

```bash
    docker run --name postgresql -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -v /data:/var/lib/postgresql/data -d postgres
```

### Prisma Migration

Execute Prisma Migration after the Database is running to Auto setup the Database schema

```bash
npx prisma migrate dev
```

### Starting Kabooty

After you started Kabooty you can access it by default [here](http://localhost:3000)

```bash
npm run dev
```
