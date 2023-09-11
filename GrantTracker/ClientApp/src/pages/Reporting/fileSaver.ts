import { Parser } from 'json2csv'
import FileSaver from 'file-saver'

export function saveCSVToFile(data, options, fileName) {
  try {
    const parser = new Parser(options)
    const csv = parser.parse(data)
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

    FileSaver.saveAs(csvData, fileName)
    console.log(csvData.text())
  }
  catch (err) {
    console.warn(err)
  }
}