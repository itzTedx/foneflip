# Onboarding Module

This module handles the complete onboarding flow for vendors, including registration, verification, organization setup, and document upload.

## Structure

```
onboarding/
├── types.d.ts          # TypeScript interfaces and types
├── storage.ts          # IndexDB storage operations
├── hooks/
│   └── use-onboarding.ts # React hook for onboarding state management
├── index.ts            # Main exports
└── README.md           # This documentation
```

## Features

- **Multi-step Onboarding**: Registration → Verification → Organization → Documents
- **Progress Tracking**: Real-time progress updates and step completion
- **Data Persistence**: Optimized IndexDB storage with caching
- **React Integration**: Custom hooks for seamless React integration
- **Type Safety**: Full TypeScript support with strict typing

## Usage

### Basic Hook Usage

```typescript
import { useOnboarding } from "@/modules/onboarding";

function OnboardingComponent() {
  const {
    progress,
    onboardingData,
    isLoading,
    error,
    startStep,
    completeCurrentStep,
    saveData,
  } = useOnboarding(userId);

  const handleStartRegistration = async () => {
    await startStep("registration", { email: "user@example.com" });
  };

  const handleCompleteStep = async () => {
    await completeCurrentStep({ verified: true });
  };

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <div>Progress: {progress?.progress}%</div>
    </div>
  );
}
```

### Direct Storage Usage

```typescript
import { 
  createStep, 
  getProgress, 
  saveOnboardingData 
} from "@/modules/onboarding";

// Create a new step
const stepId = await createStep(userId, "registration", { email: "user@example.com" });

// Get user progress
const progress = await getProgress(userId);

// Save onboarding data
await saveOnboardingData(userId, {
  registration: {
    name: "John Doe",
    email: "john@example.com",
    invitationToken: "token123",
  },
});
```

## Onboarding Steps

1. **Registration**: User account creation and basic information
2. **Verification**: Email verification and identity confirmation
3. **Organization**: Company details and business information
4. **Documents**: Trade license and Emirates ID upload

## Data Models

### OnboardingStep
```typescript
interface OnboardingStep {
  stepId: string;
  userId: string;
  stepName: OnboardingStepName | "complete";
  status: "pending" | "in_progress" | "completed" | "failed";
  data?: Record<string, unknown>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### OnboardingProgress
```typescript
interface OnboardingProgress {
  userId: string;
  currentStep: OnboardingStep["stepName"];
  completedSteps: OnboardingStep["stepName"][];
  totalSteps: number;
  progress: number; // 0-100
  startedAt: string;
  lastUpdatedAt: string;
}
```

### OnboardingData
```typescript
interface OnboardingData {
  userId: string;
  registration?: {
    name: string;
    email: string;
    invitationToken: string;
  };
  verification?: {
    email: string;
    verifiedAt: string;
  };
  organization?: {
    name: string;
    category: OrganizationCategory;
    website?: string;
    logoUrl?: string;
  };
  documents?: {
    tradeLicense?: string;
    emiratesIdFront?: string;
    emiratesIdBack?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Storage Configuration

The module uses the centralized IndexDB implementation with optimized configurations:

- **Steps Storage**: Tracks individual onboarding steps
- **Progress Storage**: Manages overall onboarding progress
- **Data Storage**: Stores onboarding form data

## Performance Features

- **Connection Pooling**: Reuses database connections
- **Intelligent Caching**: In-memory cache for frequently accessed data
- **Batch Operations**: Efficient bulk operations
- **Health Monitoring**: Built-in health checks

## Error Handling

The module includes comprehensive error handling:

```typescript
try {
  await startStep("registration", data);
} catch (error) {
  console.error("Failed to start step:", error);
  // Handle error appropriately
}
```

## Integration with Other Modules

The onboarding module integrates with:

- **Auth Module**: User authentication and verification
- **Vendors Module**: Vendor-specific onboarding flow
- **Media Module**: Document upload functionality

## Best Practices

1. **Always check loading states**: Use `isLoading` to show loading indicators
2. **Handle errors gracefully**: Display user-friendly error messages
3. **Validate data**: Ensure data integrity before saving
4. **Use TypeScript**: Leverage type safety for better development experience
5. **Monitor progress**: Track user progress for analytics

## Migration from Old Implementation

The module has been migrated from the centralized packages to the portal app for better maintainability and module-specific customization. 