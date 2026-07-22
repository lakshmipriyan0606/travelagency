export interface TermSection {
  id: string;
  number: number;
  title: string;
  content: string;
}

export interface TermCategory {
  title: string;
  sections: TermSection[];
}

export const termsData: TermCategory[] = [
  {
    title: "General Rate Policies",
    sections: [
      {
        id: "rate-validity",
        number: 1,
        title: "Rate Validity",
        content: "All rates are net B2B rates and valid for 7 days from the quotation date. Rates are subject to change without prior notice until booking is confirmed with full payment."
      },
      {
        id: "confidentiality",
        number: 2,
        title: "Confidentiality of Rates",
        content: "Rates are strictly confidential and for resale by authorized B2B partners only."
      }
    ]
  },
  {
    title: "Service Inclusions & Policies",
    sections: [
      {
        id: "inclusions-exclusions",
        number: 3,
        title: "Services Included / Excluded",
        content: "Only services clearly mentioned in the itinerary are included. Any service not specified (meals, personal expenses, optional activities, tips, insurance, etc.) is excluded."
      },
      {
        id: "transport-policy",
        number: 4,
        title: "Transport & Vehicle Policy",
        content: "Transport rates are based on selected vehicle type, passenger count, route, and usage hours. Any change in vehicle, timing, route, pickup/drop point, or passenger count will result in revised pricing. Overtime, waiting hours, and additional stops will be charged extra."
      },
      {
        id: "hotel-policy",
        number: 5,
        title: "Hotel Policy",
        content: "Hotel rates are subject to availability at time of booking. Room category and bed type are subject to hotel confirmation. Early check-in and late check-out are not guaranteed and may incur additional charges. Hotel images are for reference only."
      },
      {
        id: "attractions-policy",
        number: 6,
        title: "Attraction Tickets & Tours",
        content: "All attraction tickets and tours are subject to availability. Issued tickets are non-refundable and non-changeable unless otherwise stated. No refund for unused or partially used services."
      }
    ]
  },
  {
    title: "Financial & Booking Terms",
    sections: [
      {
        id: "payment-terms",
        number: 7,
        title: "Payment Terms",
        content: "Advance payment is mandatory to confirm bookings. Full payment must be received before service commencement unless prior credit terms are approved. All bank charges and remittance fees are to be borne by the agent."
      },
      {
        id: "cancellation-policy",
        number: 8,
        title: "Cancellation Policy",
        content: "Cancellation charges apply as per supplier policies. Peak season, public holidays, and special events may have stricter cancellation terms. No refund for no-shows or unused services."
      },
      {
        id: "amendments",
        number: 9,
        title: "Amendments",
        content: "Any amendment after confirmation is subject to availability and additional charges. Last-minute changes may not be possible."
      }
    ]
  },
  {
    title: "Legal & Liability",
    sections: [
      {
        id: "force-majeure",
        number: 10,
        title: "Force Majeure",
        content: "SASTIKAA TRAVEL SDN BHD is not liable for delays or cancellations due to events beyond control, including weather conditions, strikes, traffic issues, natural disasters, or government regulations."
      },
      {
        id: "responsibility",
        number: 11,
        title: "Responsibility & Liability",
        content: "We act only as a booking agent for third-party suppliers and are not responsible for loss, injury, damage, delay, or accidents caused by service providers."
      },
      {
        id: "travel-documents",
        number: 12,
        title: "Travel Documents",
        content: "The booking agent is responsible for ensuring passengers carry valid passports, visas, permits, and travel insurance. Any issues arising are the agent’s responsibility."
      },
      {
        id: "taxes-surcharges",
        number: 13,
        title: "Taxes & Surcharges",
        content: "All rates are quoted in MYR unless stated otherwise. Any increase in government taxes, fuel surcharges, or service fees will be charged additionally."
      },
      {
        id: "jurisdiction",
        number: 14,
        title: "Jurisdiction",
        content: "All disputes are subject to Malaysia jurisdiction only."
      },
      {
        id: "acceptance",
        number: 15,
        title: "Acceptance",
        content: "Confirmation of booking implies full acceptance of the above Terms & Conditions."
      }
    ]
  }
];

export const footerDisclaimer = "Rates subject to availability | No price guarantee without written confirmation";
