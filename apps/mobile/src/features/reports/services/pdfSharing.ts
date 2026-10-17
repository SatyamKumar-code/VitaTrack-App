import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

export const PdfSharing = {
  /**
   * Shares a generated PDF report using the native OS share sheet (TASK-P6-05)
   */
  async shareReportPdf(
    fileUri: string,
    dialogTitle = 'Share VitaTrack Clinician Health Summary'
  ): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle,
          UTI: 'com.adobe.pdf'
        });
        return true;
      }

      // Web platform fallback: create temporary anchor to download file
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const link = document.createElement('a');
        link.href = fileUri;
        link.target = '_blank';
        link.download = `VitaTrack_Clinician_Report_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error sharing clinician report PDF:', error);
      throw error;
    }
  }
};
