# AutoFix Utilities

This folder contains utility classes for the AutoFix feature.

## Files

### `fix-generator.ts`
**Purpose**: Generates proper security fixes for different vulnerability types.

**Usage**:
```typescript
import { FixGenerator } from '@/lib/utils/fix-generator';

const fix = FixGenerator.generateFix(vulnerabilityName, originalCode);
console.log(fix.fixedCode); // The remediated code
console.log(fix.explanation); // Explanation of the fix
```

**Supported Vulnerability Types**:
- Hardcoded Secrets → Environment variables
- SQL Injection → Parameterized queries
- XSS → textContent instead of innerHTML
- Command Injection → Input validation
- Path Traversal → Path sanitization
- Weak Random → Cryptographically secure random
- Weak Crypto (MD5) → bcrypt
- Information Disclosure → Remove stack traces
- Insecure HTTP → HTTPS
- SSRF → URL validation

### `mock-code-generator.ts`
**Purpose**: Generates realistic vulnerable code examples for preview when actual files are not available.

**Usage**:
```typescript
import { MockCodeGenerator } from '@/lib/utils/mock-code-generator';

const mockCode = MockCodeGenerator.generate(vulnerabilityName, fileName);
```

## Architecture

```
lib/utils/
├── fix-generator.ts          # Security fix generation logic
├── mock-code-generator.ts    # Mock vulnerable code generation
└── README.md                 # This file
```

## Integration

These utilities are used by:
- `app/dashboard/autofix/page.tsx` - AutoFix preview modal
- Future: API routes for automated PR generation
- Future: CLI tools for local scanning

## Adding New Vulnerability Types

To add support for a new vulnerability type:

1. Add a new private method in `FixGenerator` (e.g., `fixNewVulnerability`)
2. Add a case in the `generateFix` method
3. Add a corresponding mock generator in `MockCodeGenerator`
4. Update this README with the new type
