export interface AnalysisResult {
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  manipulationDetections: {
    type: string;
    description: string;
    confidence: number;
  }[];
  emotionalAnalysis: {
    triggers: string[];
    manipulationType: string;
    intensity: number;
  };
  credibilitySignals: string[];
  extractedText?: string;
  imageUrl?: string;
  url?: string;
  timestamp?: any;
  id?: string;
  forensicHash?: string;
  analysisDuration?: string;
  // Document/url-specific fields
  scanType?: 'image' | 'document' | 'url';
  documentName?: string;
  documentFindings?: {
    sourceCredibility: string;
    authorAnalysis: string;
    claimsVerification: string[];
    plagiarismIndicators: string[];
    writingStyle: string;
    recommendedActions: string[];
  };
}

export interface UserScan {
  id: string;
  userId: string;
  timestamp: any;
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  summary: string;
  details: AnalysisResult;
  imageUrl?: string;
  url?: string;
  scanType?: 'image' | 'document' | 'url';
  documentName?: string;
}
