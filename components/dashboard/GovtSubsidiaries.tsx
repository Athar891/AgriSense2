import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

const subsidiaries = [
  {
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Income support of ₹6,000 per year to all farmer families in three equal installments.',
    eligibility: 'All small and marginal farmers (landholding up to 2 hectares).',
    link: 'https://pmkisan.gov.in/'
  },
  {
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    description: 'Crop insurance scheme to protect farmers against crop loss due to natural calamities.',
    eligibility: 'All farmers growing notified crops in notified areas.',
    link: 'https://pmfby.gov.in/'
  },
  {
    title: 'Soil Health Card Scheme',
    description: 'Provides soil health cards to farmers with crop-wise recommendations for nutrients and fertilizers.',
    eligibility: 'All farmers.',
    link: 'https://soilhealth.dac.gov.in/'
  },
  {
    title: 'Kisan Credit Card (KCC)',
    description: 'Timely credit support to farmers for their cultivation and other needs.',
    eligibility: 'All farmers including tenant farmers, oral lessees, and sharecroppers.',
    link: 'https://pmkisan.gov.in/Documents/KCC.pdf'
  },
  // Add more schemes as needed
];

export default function GovtSubsidiaries() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          Govt. Subsidiaries & Schemes
          <Badge variant="outline" className="ml-2">New</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {subsidiaries.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg border bg-white dark:bg-gray-900 shadow-sm flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700 dark:text-green-300">{item.title}</span>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm mt-1">{item.description}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span className="font-medium">Eligibility:</span> {item.eligibility}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 