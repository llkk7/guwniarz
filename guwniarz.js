const fs = require('fs'); // Do obsługi plików
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config({ path: './sex.env' }); // Wczytanie zmiennych z sex.env

// Wczytanie zmiennych środowiskowych
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // ID serwera, na którym rejestrujesz komendy
const insultsFile = './insults.json'; // Plik z insultami

// Sprawdzenie, czy wymagane zmienne są dostępne
if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('Brakuje wymaganych zmiennych w pliku sex.env!');
  process.exit(1);
}

// Tworzenie klienta bota
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Intencje dla serwerów
    GatewayIntentBits.GuildMessages, // Intencje dla wiadomości na serwerze
    GatewayIntentBits.MessageContent, // Intencje do odczytu treści wiadomości
  ],
});

// Inicjalizacja pliku z insultami, jeśli nie istnieje
if (!fs.existsSync(insultsFile)) {
  fs.writeFileSync(insultsFile, JSON.stringify([]));
}

// Wczytywanie insultów z pliku
let insults = JSON.parse(fs.readFileSync(insultsFile));

// Funkcja do zapisywania insultów do pliku
const saveInsults = () => {
  fs.writeFileSync(insultsFile, JSON.stringify(insults, null, 2));
};

// Rejestracja komend slash
const commands = [
  {
    name: 'insult',
    description: 'Wygeneruj insult dla użytkownika lub słowa',
    options: [
      {
        name: 'target',
        type: 3, // STRING
        description: 'Użytkownik lub słowo, które chcesz obrazić',
        required: true,
      },
    ],
  },
  {
    name: 'addinsult',
    description: 'Dodaj nowy insult do bazy',
    options: [
      {
        name: 'insult',
        type: 3, // STRING
        description: 'Treść insultu',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Rejestrowanie komend...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });
    console.log('Komendy zostały zarejestrowane!');
  } catch (error) {
    console.error('Błąd podczas rejestrowania komend:', error);
  }
})();

// Obsługa komend slash i wiadomości tekstowych
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'addinsult') {
    const newInsult = options.getString('insult');

    // Dodawanie insultu do listy
    insults.push(newInsult);
    saveInsults();

    await interaction.reply(`sex`);
  }

  if (commandName === 'insult') {
    const target = options.getString('target');

    if (insults.length === 0) {
      return interaction.reply('huj');
    }

    // Losowy insult
    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
    await interaction.reply(`${target} ${randomInsult}`);
  }
});

// Obsługa wiadomości z wykrzyknikiem (!insult, !addinsult)
client.on('messageCreate', (message) => {
  // Ignoruj wiadomości od bota
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const command = args.shift().toLowerCase();

  if (command === '!addinsult') {
    const newInsult = args.join(' ');

    if (!newInsult) {
      return message.reply('chuju!!');
    }

    // Dodawanie insultu do listy
    insults.push(newInsult);
    saveInsults();

    return message.reply(`sex`);
  }

  if (command === '!insult') {
    if (insults.length === 0) {
      return message.reply('huj');
    }

    const target = args.join(' ') || 'twuj stary';
    const randomInsult = insults[Math.floor(Math.random() * insults.length)];
    return message.channel.send(`${target} ${randomInsult}`);
  }
});

// Logowanie bota
client.login(TOKEN);
