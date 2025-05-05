import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import express, { type Application } from 'express'

export const serveFrontend = (app: Application) => {
  const distPath = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist')
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('/{*splat}', (_, res) => {
      res.sendFile(join(distPath, 'index.html'));
    })
  }
}
