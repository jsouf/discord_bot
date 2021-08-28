# Discord bot

## Dependencies

Make sure you have the following engines installed locally : 
- **Node.js** >= 12.0.0
- **NPM**

## Installing

Next, download the code and run the following to download the dependencies : 
```
npm i
```

## Configuration

### create discord bot

- You need to create an app on https://discord.com/developers/applications.
- Copy token key (Settings > Bot).

### setup discord server 

In your discord server :
- create 3 new player roles. You have to order these roles to be below than bot role (the bot can't promote or demote higher role).
- select 3 emojis (you can add custom) that will be attached to your roles.
- create 1 role (or user an existing) for officers staff. You have to order this role to above than bot role (the bot can't do anything on higher role).
- create new Category for events. Go to permissions add permissions for these roles (View channels, Send messages, Read message history). So each channel in this category will inherits permissions.
- create new channel for bot config. Set permissions for staff only. Go to permissions, add permissions for officers role only.
- create new channel for roles assignment. Set permission for all members. Go to permissions, add permissions for these roles (View channels, Read message history), remove permissions (Send messages, Add reactions).
- create new channel for roster list. Set permission for all members. Go to permissions, add permissions for these roles (View channels, Read message history), remove permissions (Send messages, Add reactions).

### setup config.json 

In project app : 
- Rename **config.template.json** to **config.json**.
- Paste token key to "token" in your **config.json**.
- Update keys in **config.json** with ID (right click, copy ID) of each created elements.

### add bot to your discord server

- Back to https://discord.com/developers/applications > Settings > OAuth2.
- In "Scopes", check "bot". In "Bot Permissions" check "Administrator".
- Copy the link in "Scopes", paste it in a new tab.
- Select the server. The bot needs to have "Administrator" permissions.

## Running

Start up the server, via : 
```
node main.js
```

## Using

This application allows you to manage predefined roles and event management via text channels.

On start, bot will : 
- check **config.json** if correctly completed.
- create if not exists the role assigment message in the roles assignment channel.
- create or update the roster list message in the roster list channel.

Type !help to get commands list :)
