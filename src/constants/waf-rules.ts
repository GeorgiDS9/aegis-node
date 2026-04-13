// Cookie name shared between the waf-config server action and middleware
export const WAF_COOKIE_NAME = 'aegis-waf'

// Regex patterns used by middleware for request inspection.
// Exported here so tests can validate them independently of the middleware module.
export const WAF_PATTERNS: Record<string, RegExp> = {
  'WAF-SQLi': /('--|%27--|;\s*--|\/\*.*\*\/|\bor\b\s+\w+\s*=\s*\w+|\bunion\b\s+\bselect\b|\bdrop\s+table\b|\binsert\s+into\b|\bdelete\s+from\b|xp_\w+)/i,
  'WAF-XSS':  /(<\s*script[\s>]|javascript\s*:|on\w+\s*=\s*["']|<\s*iframe[\s>]|document\.cookie|eval\s*\()/i,
  'WAF-PATH': /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|\.\.%2f|%252e%252e)/i,
  'WAF-BOT':  /(scrapy|ahrefsbot|semrushbot|dotbot|petalbot|mj12bot|rogerbot|masscan|zgrab)/i,
}

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
