export interface WafRule {
  id: string
  label: string
  description: string
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM'
}

export const WAF_RULES: WafRule[] = [
  {
    id: 'WAF-SQLi',
    label: 'Block SQL Injection',
    description: 'Filter common SQLi patterns in request params',
    risk: 'CRITICAL',
  },
  {
    id: 'WAF-XSS',
    label: 'Block XSS Vectors',
    description: 'Sanitize script injection in input fields',
    risk: 'HIGH',
  },
  {
    id: 'WAF-RATE',
    label: 'Rate Limit IP',
    description: 'Cap requests at 100/min per source IP',
    risk: 'HIGH',
  },
  {
    id: 'WAF-PATH',
    label: 'Block Path Traversal',
    description: 'Reject ../../ patterns in URL paths',
    risk: 'CRITICAL',
  },
  {
    id: 'WAF-BOT',
    label: 'Detect Bot Signatures',
    description: 'Flag requests matching known bot UA strings',
    risk: 'MEDIUM',
  },
]
