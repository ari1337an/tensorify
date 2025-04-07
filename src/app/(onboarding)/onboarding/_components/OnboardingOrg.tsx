"use client";

import { useState, useEffect } from "react";
import { Input } from "@/app/_components/ui/input";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Building2, Link, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  onNext: () => void;
};

export function OnboardingOrg({ onNext }: Props) {
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isValidSlug, setIsValidSlug] = useState(true);

  useEffect(() => {
    if (!isSlugEdited) {
      const newSlug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setOrgSlug(newSlug);
      setIsValidSlug(/^[a-z0-9-]+$/.test(newSlug));
    }
  }, [orgName, isSlugEdited]);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setOrgSlug(newSlug);
    setIsValidSlug(/^[a-z0-9-]+$/.test(newSlug));
  };

  const isValid = orgName.length > 0 && isValidSlug;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-muted-foreground">
          This will be your unique space in Tensorify
        </p>
      </div>

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
            Only lowercase letters, numbers, and hyphens are allowed
          </p>
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
