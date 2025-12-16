import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Upload, FileArrowDown, FileArrowUp, Warning, CheckCircle } from '@phosphor-icons/react'
import { exportData, downloadJSON, parseImportFile, type ExportData } from '@/lib/import-export'
import type { Personnel, Unit } from '@/lib/types'

interface ImportExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personnelByUnit: Record<string, Personnel[]>
  units: Unit[]
  onImport: (data: ExportData) => void
}

export function ImportExportDialog({
  open,
  onOpenChange,
  personnelByUnit,
  units,
  onImport
}: ImportExportDialogProps) {
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const jsonData = exportData(personnelByUnit, units)
    const timestamp = new Date().toISOString().split('T')[0]
    downloadJSON(jsonData, `dreadmarch-personnel-${timestamp}.json`)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportError(null)
      setImportSuccess(false)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      setImportError('Please select a file to import')
      return
    }

    const result = await parseImportFile(selectedFile)

    if (!result.success || !result.data) {
      setImportError(result.error || 'Import failed')
      setImportSuccess(false)
      return
    }

    onImport(result.data)
    setImportSuccess(true)
    setImportError(null)
    
    setTimeout(() => {
      onOpenChange(false)
      resetImportState()
    }, 1500)
  }

  const resetImportState = () => {
    setSelectedFile(null)
    setImportError(null)
    setImportSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetImportState()
    }
    onOpenChange(newOpen)
  }

  const totalPersonnel = Object.values(personnelByUnit).reduce(
    (sum, personnel) => sum + personnel.length,
    0
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-2 border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary">
            Data Management
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Backup or transfer personnel database records
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger 
              value="export"
              className="uppercase tracking-wide font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Download size={18} className="mr-2" />
              Export
            </TabsTrigger>
            <TabsTrigger 
              value="import"
              className="uppercase tracking-wide font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Upload size={18} className="mr-2" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-6">
            <div className="border border-border rounded p-4 bg-secondary/20">
              <div className="flex items-start gap-3">
                <FileArrowDown size={24} className="text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Export Database</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a complete backup of all personnel records and unit structures in JSON format. 
                    This file can be imported later to restore or transfer data.
                  </p>
                  <div className="space-y-1 text-sm font-mono">
                    <p className="text-muted-foreground">
                      Total Units: <span className="text-foreground font-semibold">{units.length}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Total Personnel: <span className="text-foreground font-semibold">{totalPersonnel}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleExport}
              className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide"
              size="lg"
            >
              <Download size={20} className="mr-2" />
              Download Backup File
            </Button>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-6">
            <div className="border border-border rounded p-4 bg-secondary/20">
              <div className="flex items-start gap-3">
                <FileArrowUp size={24} className="text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-2">Import Database</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a previously exported JSON file to restore personnel records. 
                    This will replace all current data with the imported data.
                  </p>
                </div>
              </div>
            </div>

            <Alert className="bg-destructive/10 border-destructive/30">
              <Warning size={18} className="text-destructive" />
              <AlertDescription className="text-sm text-foreground ml-2">
                <strong>Warning:</strong> Importing will overwrite all existing personnel records and units. 
                Export your current data first if you want to keep a backup.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-primary/30 hover:bg-primary/10 font-semibold uppercase tracking-wide"
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    asChild
                  >
                    <span>
                      <Upload size={20} className="mr-2" />
                      {selectedFile ? selectedFile.name : 'Select File'}
                    </span>
                  </Button>
                </label>
              </div>

              {importError && (
                <Alert className="bg-destructive/10 border-destructive/30">
                  <Warning size={18} className="text-destructive" />
                  <AlertDescription className="text-sm text-destructive ml-2">
                    {importError}
                  </AlertDescription>
                </Alert>
              )}

              {importSuccess && (
                <Alert className="bg-primary/10 border-primary/30">
                  <CheckCircle size={18} className="text-primary" />
                  <AlertDescription className="text-sm text-primary ml-2">
                    Import successful! Data has been restored.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleImport}
                disabled={!selectedFile || importSuccess}
                className="w-full bg-primary text-primary-foreground hover:bg-accent font-semibold uppercase tracking-wide disabled:opacity-50"
                size="lg"
              >
                <FileArrowUp size={20} className="mr-2" />
                Import Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
