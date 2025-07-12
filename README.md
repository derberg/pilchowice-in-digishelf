## Overview

This is a hobby project done with passion for history: https://archiwapilchowic.org/

## Dev guide


```bash
# start extraction from DigiShelf, no API is needed
npm run extract

# prepare extracted content for website
npm run prepare

# perform translation, yes you need to get a pain OpenAI subscription
OPENAI_API_KEY=xxx npm run prepare:translation

# start website
npm run start

# explore
http://localhost:4321/

```