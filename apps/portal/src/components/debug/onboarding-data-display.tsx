"use client";

import { useEffect, useState } from "react";

import { Badge } from "@ziron/ui/badge";
import { Button } from "@ziron/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@ziron/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ziron/ui/tabs";

import { clearAllVendorData, getAllVendorData, VendorData } from "@/lib/storage/vendor-storage";
import { clearOnboardingData, useOnboarding } from "@/modules/onboarding";

interface OnboardingDataDisplayProps {
  userId: string;
}

export function OnboardingDataDisplay({ userId }: OnboardingDataDisplayProps) {
  const { progress, onboardingData, currentStep, isLoading, error, resetOnboarding } = useOnboarding(userId);

  const [vendorData, setVendorData] = useState<VendorData[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);

  const loadVendorData = async () => {
    setIsLoadingVendors(true);
    try {
      const data = await getAllVendorData();
      setVendorData(data);
    } catch (error) {
      console.error("Failed to load vendor data:", error);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllVendorData();
      await clearOnboardingData(userId);
      setVendorData([]);
      await resetOnboarding();
    } catch (error) {
      console.error("Failed to clear data:", error);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Data</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Onboarding Data (IndexedDB)</CardTitle>
            <CardDescription>User ID: {userId}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadVendorData} size="sm" variant="outline">
              Refresh
            </Button>
            <Button onClick={handleClearAll} size="sm" variant="destructive">
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs className="w-full" defaultValue="progress">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="progress">
            {progress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Current Step</h4>
                    <p className="text-muted-foreground text-sm">{progress.currentStep}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Progress</h4>
                    <p className="text-muted-foreground text-sm">{progress.progress}%</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Completed Steps</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {progress.completedSteps.map((step) => (
                      <Badge key={step} variant="secondary">
                        {step}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Started</h4>
                    <p className="text-muted-foreground text-sm">{new Date(progress.startedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Last Updated</h4>
                    <p className="text-muted-foreground text-sm">{new Date(progress.lastUpdatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No progress data available.</p>
            )}
          </TabsContent>

          <TabsContent className="space-y-4" value="data">
            {onboardingData ? (
              <div className="space-y-4">
                {onboardingData.registration && (
                  <div>
                    <h4 className="font-semibold">Registration Data</h4>
                    <div className="rounded bg-muted p-3 text-sm">
                      <p>
                        <strong>Name:</strong> {onboardingData.registration.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {onboardingData.registration.email}
                      </p>
                      <p>
                        <strong>Token:</strong> {onboardingData.registration.invitationToken}
                      </p>
                    </div>
                  </div>
                )}

                {onboardingData.verification && (
                  <div>
                    <h4 className="font-semibold">Verification Data</h4>
                    <div className="rounded bg-muted p-3 text-sm">
                      <p>
                        <strong>Email:</strong> {onboardingData.verification.email}
                      </p>
                      <p>
                        <strong>Verified At:</strong>{" "}
                        {new Date(onboardingData.verification.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {onboardingData.organization && (
                  <div>
                    <h4 className="font-semibold">Organization Data</h4>
                    <div className="rounded bg-muted p-3 text-sm">
                      <p>
                        <strong>Name:</strong> {onboardingData.organization.name}
                      </p>
                      <p>
                        <strong>Category:</strong> {onboardingData.organization.category}
                      </p>
                      <p>
                        <strong>Website:</strong> {onboardingData.organization.website || "N/A"}
                      </p>
                      <p>
                        <strong>Logo URL:</strong> {onboardingData.organization.logoUrl || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {onboardingData.documents && (
                  <div>
                    <h4 className="font-semibold">Documents Data</h4>
                    <div className="rounded bg-muted p-3 text-sm">
                      <p>
                        <strong>Business License:</strong> {onboardingData.documents.tradeLicense || "N/A"}
                      </p>
                      <p>
                        <strong>Trade License:</strong> {onboardingData.documents.tradeLicense || "N/A"}
                      </p>
                      <p>
                        <strong>Emirates ID Front:</strong> {onboardingData.documents.emiratesIdFront || "N/A"}
                      </p>
                      <p>
                        <strong>Emirates ID Back:</strong> {onboardingData.documents.emiratesIdBack || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No onboarding data available.</p>
            )}
          </TabsContent>

          <TabsContent className="space-y-4" value="vendor">
            {isLoadingVendors ? (
              <p className="text-muted-foreground">Loading vendor data...</p>
            ) : vendorData.length > 0 ? (
              <div className="space-y-4">
                {vendorData.map((vendor) => (
                  <div className="rounded border p-4" key={vendor.userId}>
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-semibold">{vendor.organizationName}</h4>
                      <Badge variant="secondary">{vendor.category}</Badge>
                    </div>
                    <div className="space-y-1 text-muted-foreground text-sm">
                      <p>
                        <strong>User ID:</strong> {vendor.userId}
                      </p>
                      {vendor.username && (
                        <p>
                          <strong>Username:</strong> {vendor.username}
                        </p>
                      )}
                      {vendor.email && (
                        <p>
                          <strong>Email:</strong> {vendor.email}
                        </p>
                      )}
                      {vendor.website && (
                        <p>
                          <strong>Website:</strong> {vendor.website}
                        </p>
                      )}
                      <p>
                        <strong>Created:</strong> {new Date(vendor.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <strong>Updated:</strong> {new Date(vendor.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No vendor data available.</p>
            )}
          </TabsContent>

          <TabsContent className="space-y-4" value="steps">
            {currentStep ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Current Step</h4>
                  <div className="rounded bg-muted p-3 text-sm">
                    <p>
                      <strong>Step ID:</strong> {currentStep.stepId}
                    </p>
                    <p>
                      <strong>Step Name:</strong> {currentStep.stepName}
                    </p>
                    <p>
                      <strong>Status:</strong> {currentStep.status}
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(currentStep.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <strong>Updated:</strong> {new Date(currentStep.updatedAt).toLocaleString()}
                    </p>
                    {currentStep.completedAt && (
                      <p>
                        <strong>Completed:</strong> {new Date(currentStep.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No current step data available.</p>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="mt-4 rounded border border-destructive/20 bg-destructive/10 p-3">
            <p className="text-destructive text-sm">Error: {error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
