import { Card } from "@travelagency/ui";
import { ReusableInput } from "@travelagency/forms";
import { SelectField } from "@travelagency/forms";
import { ReusableCheckbox } from "@travelagency/forms";
import { Tag, Eye, ShieldCheck } from "lucide-react";
import { SectionHeader, StyledField } from "./PackageFormUI";
import { rankOptions, statusOptions } from "../constant";

export function PackageFormPricing({ formControl, isActivity, watch }: { formControl: any, isActivity: boolean, watch: any }) {
  const price = watch("price");
  const offerPrice = watch("offerPrice");
  const discount = Number(price) > 0 ? Math.round(((Number(price) - Number(offerPrice)) / Number(price)) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 p-6 md:p-8 rounded-[20px] overflow-visible gap-5" hoverable={false}>
        <SectionHeader icon={Tag} title="Pricing Details" subtitle="Set the value and competitive offers" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-5 mt-2">
          <StyledField>
            <ReusableInput control={formControl} name="price" label="Price (RM)" required variant="floating" />
          </StyledField>
          <StyledField>
            <ReusableInput control={formControl} name="offerPrice" label="Offer (RM)" required variant="floating" />
          </StyledField>
          <StyledField>
            <ReusableInput control={formControl} name="hotelName" label="Hotel Name" placeholder="e.g. Grand Mercure" required variant="floating" />
          </StyledField>
        </div>
        <div className="mt-8 flex items-center justify-between bg-[#F8B400]/08 rounded-2xl border border-[#F8B400]/20 border-dashed p-5">
          <div>
            <p className="text-[10px] font-black text-[#F8B400] uppercase tracking-widest mb-1">Recommended Discount</p>
            <p className="text-xs text-zinc-400 font-medium">Automatically calculated based on pricing</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-white tracking-tighter">
              {discount}%
              <span className="text-lg text-[#F8B400] ml-1">OFF</span>
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8 rounded-[20px] overflow-visible gap-5" hoverable={false}>
        <SectionHeader icon={Eye} title="Visibility" subtitle="Platform status" />
        <div className="space-y-5 mt-2">
          <StyledField>
            <SelectField control={formControl} name="status" label="System Status" options={statusOptions} required variant="floating" />
          </StyledField>
          <div className="flex items-center gap-3">
            <StyledField className="flex-1">
              <ReusableCheckbox control={formControl} name="isActive" label="Live Website" />
            </StyledField>
            <StyledField className="flex-1">
              <ReusableCheckbox control={formControl} name="isBestPackage" label="Promoted" />
            </StyledField>
          </div>
          {watch("isBestPackage") && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <SelectField control={formControl} name="bestRank" label="Promotion Rank" options={rankOptions} required variant="floating" />
            </div>
          )}
        </div>
      </Card>

      {isActivity && (
        <Card className="p-6 md:p-8 rounded-[20px] overflow-visible gap-5 mt-2" hoverable={false}>
          <SectionHeader icon={ShieldCheck} title="Service Terms" subtitle="Redemption Details" />
          <div className="space-y-4 mt-2">
            <StyledField>
              <ReusableCheckbox control={formControl} name="isInstantConfirmation" label="Instant Confirmation" />
            </StyledField>
            <StyledField>
              <ReusableCheckbox control={formControl} name="isNonRefundable" label="Non Refundable" />
            </StyledField>
          </div>
        </Card>
      )}
    </div>
  );
}
