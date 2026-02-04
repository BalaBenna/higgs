import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useConfigs } from '@/contexts/configs'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CommonDialogContent from './DialogContent'

// Update notification dialog - disabled for web version
const UpdateNotificationDialog = () => {
  const { t } = useTranslation()
  const { showUpdateDialog, setShowUpdateDialog } = useConfigs()

  const handleClose = useCallback(() => {
    setShowUpdateDialog(false)
  }, [setShowUpdateDialog])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setShowUpdateDialog(open)
    },
    [setShowUpdateDialog]
  )

  // This dialog is disabled for web version
  // Auto-updates are only available in Electron desktop app
  return null
}

export default UpdateNotificationDialog
