# AI Bartender Setup Guide

The AI Bartender feature uses your Anthropic API key to provide personalized cocktail recommendations. The API key is configured server-side for all users.

## Setup Instructions

### 1. Get Your Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `sk-ant-...`)

### 2. Configure Your Server

1. Create a `.env` file in the root of your project (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
   ```

3. Save the file

### 3. Restart Your Server

```bash
npm run dev:all
```

Or if running servers separately:
```bash
npm run server
```

## Usage

- Users don't need to provide their own API key
- The AI feature will work automatically for all logged-in users
- All AI usage is billed to your Anthropic account
- You can monitor usage in the [Anthropic Console](https://console.anthropic.com/)

## Cost Management

- The app uses `claude-3-haiku-20240307` (fast and affordable model)
- Each AI query costs approximately $0.001-0.005 depending on length
- Set usage limits in your Anthropic Console to prevent unexpected charges

## Troubleshooting

**Error: "AI feature not configured"**
- Make sure you created a `.env` file with `ANTHROPIC_API_KEY`
- Restart your server after adding the API key

**Error: "socket hang up"**
- Check your internet connection
- Verify the API key is valid
- Check Anthropic's service status

**Error: "Invalid API key"**
- Your API key might be expired or revoked
- Generate a new key in Anthropic Console
- Update your `.env` file and restart the server
