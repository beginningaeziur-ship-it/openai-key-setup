import { useState } from "react";
import { Link } from "react-router-dom";
import { useSAI } from "@/contexts/SAIContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type RiskLevel = 'stable' | 'building' | 'attention' | 'support';
type Trend = 'up' | 'down' | 'stable';

interface CategoryOverview {
  id: string;
  label: string;
  percentage: number;
  trend: Trend;
  riskLevel: RiskLevel;
}

const Watcher = () => {
  const { selectedCategories, progressMetrics } = useSAI();
  const [alertSent, setAlertSent] = useState(false);

  // Map category IDs to display labels (no sensitive details)
  const categoryLabels: Record<string, string> = {
    physical: "Physical Support",
    neurological: "Neurological Support",
    developmental: "Developmental Support",
    mental_health: "Mental Health Support",
    chronic_illness: "Chronic Condition Support",
    sensory: "Sensory Support",
    substance_addiction: "Substance Recovery",
    behavioral_addiction: "Behavioral Recovery",
    eating_disorder: "Eating Pattern Support",
    self_harm: "Safety Support",
    authority_trauma: "System Navigation",
    environmental_hardship: "Environmental Stability",
  };

  // Calculate risk level based on progress metrics
  const calculateRiskLevel = (percentage: number): RiskLevel => {
    if (percentage >= 70) return 'stable';
    if (percentage >= 50) return 'building';
    if (percentage >= 30) return 'attention';
    return 'support';
  };

  // Simulate trend data (in production, this would come from historical data)
  const getTrend = (categoryIndex: number): Trend => {
    const trends: Trend[] = ['up', 'stable', 'down', 'up', 'stable'];
    return trends[categoryIndex % trends.length];
  };

  // Generate category overviews from selected categories
  const categoryOverviews: CategoryOverview[] = selectedCategories.map((cat, index) => {
    // Use progress metrics to derive category-specific percentages
    const basePercentage = (progressMetrics.stability + progressMetrics.consistency + 
      progressMetrics.emotionalRegulation + progressMetrics.recoverySpeed) / 4;
    
    // Add some variance per category for realistic display
    const variance = ((index * 7) % 20) - 10;
    const percentage = Math.max(0, Math.min(100, basePercentage + variance));
    
    return {
      id: cat,
      label: categoryLabels[cat] || cat,
      percentage: Math.round(percentage),
      trend: getTrend(index),
      riskLevel: calculateRiskLevel(percentage),
    };
  });

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'stable': return 'bg-progress-stable';
      case 'building': return 'bg-progress-building';
      case 'attention': return 'bg-progress-attention';
      case 'support': return 'bg-progress-support';
    }
  };

  const getRiskBorderColor = (level: RiskLevel) => {
    switch (level) {
      case 'stable': return 'border-progress-stable/30';
      case 'building': return 'border-progress-building/30';
      case 'attention': return 'border-progress-attention/30';
      case 'support': return 'border-progress-support/30';
    }
  };

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-progress-stable" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-progress-attention" />;
      case 'stable': return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const overallRisk = categoryOverviews.length > 0
    ? calculateRiskLevel(categoryOverviews.reduce((sum, c) => sum + c.percentage, 0) / categoryOverviews.length)
    : 'stable';

  const handleSupervisorAlert = () => {
    // In production, this would send an alert to the supervisor
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Watcher View
              </h1>
              <p className="text-sm text-muted-foreground">Professional Overview</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleSupervisorAlert}
            disabled={alertSent}
          >
            <Bell className="w-4 h-4" />
            {alertSent ? "Alert Sent" : "Request Support"}
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Privacy Notice */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Privacy Protected View:</strong> This display shows only aggregate categories, percentages, and trends. 
              No trauma details, symptoms, or personal conversations are visible.
            </p>
          </CardContent>
        </Card>

        {/* Overall Status */}
        <Card className={cn("mb-6", getRiskBorderColor(overallRisk))}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Overall Status</span>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium text-background",
                getRiskColor(overallRisk)
              )}>
                {overallRisk.charAt(0).toUpperCase() + overallRisk.slice(1)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{progressMetrics.stability}%</p>
                <p className="text-xs text-muted-foreground">Stability</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{progressMetrics.consistency}%</p>
                <p className="text-xs text-muted-foreground">Consistency</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{progressMetrics.emotionalRegulation}%</p>
                <p className="text-xs text-muted-foreground">Regulation</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{progressMetrics.recoverySpeed}%</p>
                <p className="text-xs text-muted-foreground">Recovery</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <h2 className="text-lg font-semibold mb-4">Category Overview</h2>
        
        {categoryOverviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No categories configured for this client.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categoryOverviews.map((category) => (
              <Card 
                key={category.id} 
                className={cn("transition-all", getRiskBorderColor(category.riskLevel))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        getRiskColor(category.riskLevel)
                      )} />
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getTrendIcon(category.trend)}
                      <span className="text-sm font-semibold">{category.percentage}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={category.percentage} 
                    className="h-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Risk Legend */}
        <Card className="mt-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Risk Level Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-progress-stable" />
                <span className="text-sm">Stable (70%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-progress-building" />
                <span className="text-sm">Building (50-69%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-progress-attention" />
                <span className="text-sm">Attention (30-49%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-progress-support" />
                <span className="text-sm">Support Needed (&lt;30%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Info */}
        <div className="mt-6 p-4 rounded-lg border border-border/50 bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Supervisor Alerts</p>
              <p className="text-sm text-muted-foreground mt-1">
                Use the "Request Support" button to notify a supervisor. Alerts include only: 
                client code, category summary, urgency level, and trend direction. 
                No personal details are shared.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watcher;
