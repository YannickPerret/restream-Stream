import fs, { PathLike } from 'node:fs'
import puppeteer from 'puppeteer'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import Asset from '#models/asset'
import path from 'node:path'

interface MultipartFile {
  path?: PathLike
  tmpPath?: PathLike
  extname: string
  type: string
}

export default class InvoiceService {
  static async createInvoice(content) {
    try {
      const invoicesDir = app.publicPath('invoices')

      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true })
      }

      const initialPath = path.join(invoicesDir, `${cuid()}.html`)

      fs.writeFileSync(initialPath, content)

      const finalPath = path.join(invoicesDir, `${cuid()}.pdf`)

      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(`file://${initialPath}`, { waitUntil: 'networkidle2' })

      await page.pdf({
        path: finalPath,
        format: 'A4',
        printBackground: true,
      })

      await browser.close()
      fs.unlinkSync(initialPath)
      const file: MultipartFile = {
        path: finalPath,
        extname: 'pdf',
        type: 'application/pdf',
      }

      const remotePath = await Asset.uploadToS3(file, 'invoices')
      fs.unlinkSync(finalPath)

      return remotePath
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }
}
