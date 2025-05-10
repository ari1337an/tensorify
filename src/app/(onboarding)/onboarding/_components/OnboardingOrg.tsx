"use client";

import { useState, useEffect } from "react";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import {
  Building2,
  Link,
  CheckCircle2,
  AlertCircle,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 63; // Standard subdomain length limit

type Props = {
  onOrgDataChange: (data: {
    orgName: string;
    orgSlug: string;
    orgSize: string;
    orgUrl: string;
  }) => void;
  onNext: () => void;
};

const orgSizes = [
  { value: "xs", label: "Less than 20 people" },
  { value: "sm", label: "20-99 people" },
  { value: "md", label: "100-499 people" },
  { value: "lg", label: "500-999 people" },
  { value: "xl", label: "1000+ people" },
] as const;

export function OnboardingOrg({ onOrgDataChange, onNext }: Props) {
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgSize, setOrgSize] = useState<string>("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isValidSlug, setIsValidSlug] = useState(true);
  const [slugError, setSlugError] = useState<string | null>(null);

  // Handle slug generation from org name
  useEffect(() => {
    if (!isSlugEdited && orgName) {
      const newSlug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setOrgSlug(newSlug);
      validateSlug(newSlug);
    }
  }, [orgName, isSlugEdited]);

  const validateSlug = (slug: string) => {
    if (slug.length < SLUG_MIN_LENGTH) {
      setSlugError(`URL must be at least ${SLUG_MIN_LENGTH} characters`);
      setIsValidSlug(false);
      return false;
    }
    if (slug.length > SLUG_MAX_LENGTH) {
      setSlugError(`URL cannot exceed ${SLUG_MAX_LENGTH} characters`);
      setIsValidSlug(false);
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError(
        "URL can only contain lowercase letters, numbers, and hyphens"
      );
      setIsValidSlug(false);
      return false;
    }
    setSlugError(null);
    setIsValidSlug(true);
    return true;
  };

  // Notify parent only when data actually changes, using a regular effect
  useEffect(() => {
    // Only notify parent if we have valid, complete data
    if (orgName && orgSlug && isValidSlug && orgSize) {
      const orgUrl = orgSlug;
      onOrgDataChange({ orgName, orgSlug, orgSize, orgUrl });
    }
  }, [orgName, orgSlug, isValidSlug, orgSize, onOrgDataChange]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setOrgSlug(newSlug);
    validateSlug(newSlug);
  };

  const handleOrgSizeChange = (value: string) => {
    setOrgSize(value);
  };

  const isValid = orgName.length > 0 && isValidSlug && orgSize !== "";

  return (
    <div className="space-y-6">
      {/* <div className="space-y-2">
        <p className="text-muted-foreground">
          This will be your unique space in Tensorify
        </p>
      </div> */}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="orgName" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Organization Name
          </Label>
          <Input
            id="orgName"
            placeholder="Acme Inc."
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orgSlug" className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            Organization URL
          </Label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Input
                id="orgSlug"
                value={orgSlug}
                onChange={handleSlugChange}
                className={`font-mono h-11 pr-10 ${
                  isValidSlug ? "border-green-500/50" : "border-red-500/50"
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isValidSlug ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
            <span className="text-muted-foreground whitespace-nowrap px-3 py-2 bg-muted rounded-md">
              .app.tensorify.io
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {slugError ||
              "Only lowercase letters, numbers, and hyphens are allowed"}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Organization Size
          </Label>
          <Select value={orgSize} onValueChange={handleOrgSizeChange}>
            <SelectTrigger className="w-full h-11 bg-background border-input hover:bg-accent hover:text-accent-foreground focus:ring-0 focus:ring-offset-0">
              <SelectValue
                placeholder="Select organization size"
                className="text-muted-foreground"
              />
            </SelectTrigger>
            <SelectContent className="w-full min-w-[320px]">
              {orgSizes.map((size) => (
                <SelectItem
                  key={size.value}
                  value={size.value}
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground"
                >
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        className="pt-4"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Button
          onClick={onNext}
          disabled={!isValid}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
