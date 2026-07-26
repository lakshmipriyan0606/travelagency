import { Card } from "@travelagency/ui";
import { ReusableInput } from "@travelagency/forms";
import { ReusableTextArea } from "@travelagency/forms";
import { SelectField } from "@travelagency/forms";
import { ReusableCheckbox } from "@travelagency/forms";
import { Package, Clock, Calendar, Tag } from "lucide-react";
import { SectionHeader, StyledField } from "./PackageFormUI";
import { packageTypes, rankOptions, activityCategoryOptions } from "../constant";
import { destinationOptions } from "@/config/destinations";

export function PackageFormBasicInfo({ formControl, isActivity, watch }: { formControl: any, isActivity: boolean, watch: any }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md transition-all">
        <SectionHeader icon={Package} title="General Information" subtitle="Define the core identity of this travel package" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2">
          <StyledField>
            <ReusableInput control={formControl} name="packageName" label={isActivity ? "Activity Name" : "Package Name"} required variant="floating" />
          </StyledField>
          <StyledField>
            <ReusableTextArea control={formControl} name="packageDescription" label="Detailed Description" required variant="floating" />
          </StyledField>
          <StyledField>
            <SelectField control={formControl} name="location" label="Main Location" options={destinationOptions} required variant="floating" />
          </StyledField>
          <StyledField>
            <ReusableInput control={formControl} name="country" label="Country" required variant="floating" />
          </StyledField>
          {!isActivity && (
            <StyledField>
              <SelectField control={formControl} name="packageType" label="Category" options={packageTypes} required variant="floating" />
            </StyledField>
          )}
          <StyledField>
            <ReusableInput control={formControl} name="daysAndNights" label="Duration" placeholder="e.g. 4 hours" required variant="floating" icon={isActivity ? Clock : Calendar} />
          </StyledField>
          {isActivity ? (
            <>
              <StyledField>
                <ReusableCheckbox control={formControl} name="isBestPackage" label="Promoted" />
              </StyledField>
              {watch("isBestPackage") && (
                <StyledField>
                  <SelectField control={formControl} name="bestRank" label="Promotion Rank" options={rankOptions} required variant="floating" />
                </StyledField>
              )}
            </>
          ) : (
            <StyledField>
              <ReusableCheckbox control={formControl} name="isBestPackage" label="Promoted" />
            </StyledField>
          )}
          {isActivity && (
            <StyledField>
              <SelectField
                control={formControl}
                name="activityCategory"
                label="Activity Category"
                options={activityCategoryOptions}
                variant="floating"
                required
              />
              {!watch("activityCategory") && (
                <p className="text-[10px] text-amber-600 font-bold mt-1 animate-pulse">
                  ⚠️ Please select an activity category for this to show in the Activity section!
                </p>
              )}
            </StyledField>
          )}
        </div>
      </Card>

      <Card className="p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md transition-all mt-6">
        <SectionHeader icon={Tag} title="SEO Configuration" subtitle="Optimize your package for search engines" />
        <div className="grid grid-cols-1 gap-1 mt-2">
          <StyledField>
            <ReusableInput control={formControl} name="seo.title" label="SEO Title" variant="floating" />
          </StyledField>
          <StyledField>
            <ReusableTextArea control={formControl} name="seo.description" label="SEO Description" variant="floating" />
          </StyledField>
          <StyledField>
            <ReusableInput control={formControl} name="seo.keywords" label="SEO Keywords" variant="floating" />
          </StyledField>
        </div>
      </Card>
    </div>
  );
}

