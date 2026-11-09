export interface IProperty {
  id: number;
  imageUrl: string;
  timeEstimate: string;
  price: number;
  originalPrice?: number;
  arv: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
}

export interface ICategory {
  id: number;
  title: string;
  listingCount: number;
  image: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
  online?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  propertyType: string; // e.g. "3bd house"
  city: string;
  county: string;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  content: string;
  time: string; // e.g. "10:22 AM"
}

export interface ChatThread {
  contact: ChatContact;
  dateLabel: string; // e.g. "JUNE 14, 2024"
  messages: ChatMessage[];
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  company?: string;
  bio?: string;
  totalListing?: number;
  avgRating?: number;
  profile: string;
  createdAt: string;
}

export interface IDocument {
  _id: string;
  name: string;
  size: string;
  updated: string;
  url: string;
}

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IOpenHouse {
  date?: string;
  startTime?: string;
  endTime?: string;
}

// ================================================= backend response =================================================

export type TPropertyStatus =
  | "Pending"
  | "Active"
  | "Under Contract"
  | "Sold"
  | "Rejected";

export interface IPropertyResponse {
  _id: string;
  status: TPropertyStatus;

  propertyType: string;
  useType?: string;
  useTypeOther?: string;

  // Ownership
  ownership: "own" | "assignable";

  location: ILocation;

  // Basic Information
  streetAddress: string;
  state: string;
  city: string;
  zipCode: string;
  county: string;
  countyType?: string;
  parcelIds?: string;
  listingPrice: number;
  buyItNowPrice?: number;
  oldListingPrice?: number;
  arv?: number;
  marketingDescription: string;
  utilities?: string;

  // Property Specifications — dynamic, keyed by SpecField.name
  specifications: Record<string, string | number>;

  // Major Components & Ages
  roofMaterial?: string;
  roofMaterialOther?: string;
  roofAge?: number;
  heatingSystem?: string;
  heatingSystemOther?: string;
  heatingAge?: number;
  cooling?: string;
  coolingOther?: string;
  coolingAge?: number;
  waterHeating?: string;
  waterHeatingOther?: string;
  waterHeatingAge?: number;
  water?: string;
  waterOther?: string;
  sewer?: string;
  sewerOther?: string;
  foundation?: string;
  foundationOther?: string;
  otherUpdates?: string;

  // HOA
  hasHoa: "yes" | "no";
  hoaAmount?: number;
  hoaFrequency?: "Monthly" | "Quarterly" | "Annually";
  hoaIncludes?: string;

  // Closing
  titleCompany?: string;
  closingDate: string;

  // Files (S3 URLs after upload middleware)
  photos: string[];
  documents?: IDocument[];

  isDeleted: boolean;

  // utils properties
  totalViews: number;
  totalSaved: number;
  totalOffers: number;
  totalRsvp: number;

  openHouse: IOpenHouse;

  seller: IUser;

  // Usually present from Mongoose timestamps, add if your schema has `timestamps: true`
  createdAt: string;
  updatedAt: string;
}

export interface ISavePropertiesResponse {
  _id: string;
  user: string;
  property: IPropertyResponse;
  createdAt: string;
  updatedAt: string;
}

export interface IMetaData {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
}

export interface IReview {
  _id: string;
  user: IUser;
  seller: string;
  property: string;
  rating: number;
  review: string;
  createdAt: string;
}

export interface IRatingBreakdown {
  star: number;
  count: number;
}

export interface IReviewSummary {
  avgRating: number;
  totalReviews: number;
  ratingBreakdown: IRatingBreakdown[];
}

export interface ISellerReviewData {
  data: IReview[];
  meta: IMetaData;
  summary: IReviewSummary;
}

export type OfferStatus =
  | "pending"
  | "countered"
  | "accepted"
  | "rejected"
  | "withdrawn";
export type OfferParty = "buyer" | "seller";

export interface IOfferTerms {
  offerAmount: number;
  earnestMoney: number;
  financingType: string;
  otherFinancingType?: string;
  financingTerms?: string;

  closingCostOption: string;
  sellerContribution?: number;

  inspectionContingency: "yes" | "no";
  inspectionDays?: number;
  appraisalContingency: "yes" | "no";
  // appraisalDays?: number;

  hasAgent: "yes" | "no";
  agentName?: string;
  brokerageName?: string;
  commission?: string;
  paidBy?: OfferParty;

  personalPropertyIncluded?: string;
  itemsToBeRemoved?: string;

  titleCompany?: string;
  closingDate?: string;
  possession?: string;
  sellerPostClosingDays?: number;

  additionalTerms?: string;
  notesToSeller?: string;
  createdAt: Date;
}

export interface IOfferHistoryEntry extends IOfferTerms {
  round: number;
  madeBy: OfferParty;
  madeByUser: IUser | string;
  createdAt: Date;
  status: OfferStatus;
}

export interface IOffer {
  _id: string;
  property: IPropertyResponse;
  buyer: IUser;
  seller: IUser;

  status: OfferStatus;
  currentRound: number;
  lastActionBy: OfferParty;

  currentTerms: IOfferTerms; // latest terms on the table, whoever proposed them
  history: IOfferHistoryEntry[]; // full audit trail, oldest first

  supportingDocuments: IDocument[];

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthorizeSigner {
  name: string;
  email: string;
  isSigned: boolean;
  signatureImage?: string;
  signedAt?: Date | string | null;
}

export interface IAgreement {
  _id: string;
  offer: string;
  property: string;
  buyer: string;
  seller: string;
  status: "processing" | "completed";
  agreementMainDoc: string;
  propertyAgreementDoc: string;
  buyerAuthorizeSigner: IAuthorizeSigner[];
  sellerAuthorizeSigner: IAuthorizeSigner[];
  isDeleted: boolean;
}
