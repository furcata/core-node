/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {User} from '@fabricelements/shared-helpers/user';
import {z} from 'zod';
import {BaseFirestore, baseFirestoreShape} from '../interface/base_db.js';
import {MessageQueue, messageQueueShape} from '../interface/queue.js';
import {
  AssertSchemaOutput,
  auditTimestamp,
  counter,
  nonEmptyString,
  ParseResult,
  parseOrThrow,
  parseResult,
} from '../interface/schema.js';

/**
 * Namespace for account models representing business or government entities
 * registered on the Furcata platform.
 *
 * An account is the top-level organisational unit that owns messaging services,
 * events, posts, and pricing records. Account documents drive Twilio brand
 * registration (A2P 10DLC), Campaign Verify compliance, and billing via Stripe
 * Connected Accounts. Cloud Functions enforce status transitions and validate
 * registration data before submitting it to third-party providers.
 */
export namespace Account {
  /**
   * Lifecycle status of an account, used by Cloud Functions to gate access to
   * messaging services and queue processing.
   *
   * An account must be `active` for its message queue to run. Setting the
   * status to `paused` is the required mechanism for stopping the queue
   * without permanently deactivating the account.
   */
  export enum Status {
    active = 'active',
    inactive = 'inactive',
    suspended = 'suspended',
    // The user should pause the account to be able to stop the queue
    paused = 'paused',
    draft = 'draft',
    review = 'review',
  }

  /**
   * High-level classification of the account organisation type, used for
   * Twilio brand registration and compliance routing.
   */
  export enum Type {
    business = 'business',
    government = 'government',
    nonProfit = 'non_profit',
  }

  /**
   * Access-control role assigned to a user within an account, used by
   * Firestore security rules and Cloud Function permission checks.
   */
  export enum Roles {
    agent = 'agent',
    admin = 'admin',
    owner = 'owner',
    guest = 'guest',
  }

  /**
   * Accepted job-position values for the authorised representative during
   * Twilio brand registration.
   */
  export enum AuthorizedRepresentativeJobPosition {
    director = 'Director',
    gm = 'GM',
    vp = 'VP',
    ceo = 'CEO',
    cfo = 'CFO',
    generalCounsel = 'General Counsel',
    other = 'Other',
  }

  /**
   * Contact and identity details for a person authorised to act on behalf of
   * the account during Twilio brand registration.
   *
   * Twilio requires at least one authorised representative; a second is
   * optional for additional verification.
   */
  export interface AuthorizedRepresentative {
    /**
     * Representative's legal first name.
     */
    firstName?: string | null;
    /**
     * Representative's legal last name.
     */
    lastName?: string | null;
    /**
     * Representative's business email address.
     */
    email?: string | null;
    /**
     * Representative's direct phone number in E.164 format.
     */
    phoneNumber?: string | null;
    /**
     * Representative's business title as it appears on company documents.
     */
    businessTitle?: string | null;
    /**
     * Representative's seniority or functional role; see
     * {@link AuthorizedRepresentativeJobPosition} for accepted values.
     */
    jobPosition?: AuthorizedRepresentativeJobPosition | null;
  }

  // This is required for Twilio brand registration. Must be calculated depending on the estimatedVolume.
  // brand_type accepted values: 'SOLE_PROPRIETOR', 'LOW_VOLUME_STANDARD', 'STANDARD'
  /**
   * Twilio brand type required for A2P 10DLC registration; determined
   * automatically from the account's `estimatedVolume`.
   *
   * Accepted values for the Twilio API are `'SOLE_PROPRIETOR'`,
   * `'LOW_VOLUME_STANDARD'`, and `'STANDARD'`.
   */
  export enum BrandType {
    // SOLE_PROPRIETOR is only available for the US, but we don't use it
    soleProprietor = 'SOLE_PROPRIETOR',
    lowVolumeStandard = 'LOW_VOLUME_STANDARD',
    standard = 'STANDARD',
  }

  // company_type accepted values: 'public','private','non-profit','government'
  /**
   * Legal structure classification of the company as required by Twilio's
   * brand registration API.
   *
   * Accepted values are `'public'`, `'private'`, `'non-profit'`, and
   * `'government'`.
   */
  export enum CompanyType {
    public = 'public',
    private = 'private',
    nonProfit = 'non-profit',
    government = 'government',
  }

  // BusinessType accepted values:
  // 'Sole Proprietorship', 'Partnership', 'Limited Liability Corporation', 'Co-operative', 'Non-profit Corporation', 'Corporation'
  /**
   * Legal form of the business entity as required by Twilio's brand
   * registration API.
   *
   * Accepted values are `'Sole Proprietorship'`, `'Partnership'`,
   * `'Limited Liability Corporation'`, `'Co-operative'`,
   * `'Non-profit Corporation'`, and `'Corporation'`.
   */
  export enum BusinessType {
    soleProprietorship = 'Sole Proprietorship',
    partnership = 'Partnership',
    limitedLiabilityCorporation = 'Limited Liability Corporation',
    coOperative = 'Co-operative',
    nonProfitCorporation = 'Non-profit Corporation',
    corporation = 'Corporation',
  }

  // BusinessIndustry accepted values:
  // AUTOMOTIVE, AGRICULTURE, BANKING, CONSTRUCTION, CONSUMER, EDUCATION, ENGINEERING,
  // ENERGY, OIL_AND_GAS, FAST_MOVING_CONSUMER_GOODS, FINANCIAL, FINTECH,
  // FOOD_AND_BEVERAGE, GOVERNMENT, HEALTHCARE, HOSPITALITY, INSURANCE, LEGAL,
  // MANUFACTURING, MEDIA, ONLINE, PROFESSIONAL_SERVICES, RAW_MATERIALS, REAL_ESTATE,
  // RELIGION, RETAIL, JEWELRY, TECHNOLOGY, TELECOMMUNICATIONS, TRANSPORTATION, TRAVEL,
  // ELECTRONICS, NOT_FOR_PROFIT
  /**
   * Primary industry vertical of the account, submitted to Twilio during
   * A2P 10DLC brand registration.
   *
   * The full list of accepted values is documented in the inline comment above
   * this enum.
   */
  export enum BusinessIndustry {
    automotive = 'AUTOMOTIVE',
    agriculture = 'AGRICULTURE',
    banking = 'BANKING',
    construction = 'CONSTRUCTION',
    consumer = 'CONSUMER',
    education = 'EDUCATION',
    engineering = 'ENGINEERING',
    energy = 'ENERGY',
    oilAndGas = 'OIL_AND_GAS',
    fastMovingConsumerGoods = 'FAST_MOVING_CONSUMER_GOODS',
    financial = 'FINANCIAL',
    fintech = 'FINTECH',
    foodAndBeverage = 'FOOD_AND_BEVERAGE',
    government = 'GOVERNMENT',
    healthcare = 'HEALTHCARE',
    hospitality = 'HOSPITALITY',
    insurance = 'INSURANCE',
    legal = 'LEGAL',
    manufacturing = 'MANUFACTURING',
    media = 'MEDIA',
    online = 'ONLINE',
    professionalServices = 'PROFESSIONAL_SERVICES',
    rawMaterials = 'RAW_MATERIALS',
    realEstate = 'REAL_ESTATE',
    religion = 'RELIGION',
    retail = 'RETAIL',
    jewelry = 'JEWELRY',
    technology = 'TECHNOLOGY',
    telecommunications = 'TELECOMMUNICATIONS',
    transportation = 'TRANSPORTATION',
    travel = 'TRAVEL',
    electronics = 'ELECTRONICS',
    notForProfit = 'NOT_FOR_PROFIT',
  }

  // BusinessRegionsOfOperations accepted values:
  // 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'USA_AND_CANADA', 'AUSTRALIA'
  /**
   * Geographic regions where the account operates, submitted to Twilio during
   * A2P 10DLC brand registration.
   *
   * Accepted values are `'AFRICA'`, `'ASIA'`, `'EUROPE'`, `'LATIN_AMERICA'`,
   * `'USA_AND_CANADA'`, and `'AUSTRALIA'`.
   */
  export enum BusinessRegionsOfOperations {
    africa = 'AFRICA',
    asia = 'ASIA',
    europe = 'EUROPE',
    latinAmerica = 'LATIN_AMERICA',
    usaAndCanada = 'USA_AND_CANADA',
    australia = 'AUSTRALIA',
  }

  // EIN USA: Employer Identification Number (EIN)
  // DUNS USA: DUNS Number (Dun & Bradstreet)
  // CCN Canada: Canadian Corporation Number
  //
  // NOTE: MUST BE UPPERCASE BEFORE SENDING TO TWILIO
  // CBN Canada: Canadian Business Number
  // CN Great Britain: Company Number
  // ACN Australia: Company Number from ASIC (ACN)
  // CIN India: Corporate Identity Number
  // VAT Estonia: VAT Number
  // VATRN Romania: VAT Registration Number
  // RN Israel: Registration Number
  // Other Other
  /**
   * Type of government-issued business registration number provided to Twilio
   * for identity verification during A2P 10DLC brand registration.
   *
   * All values must be sent to Twilio in uppercase. The inline comment above
   * lists the full mapping of identifiers to countries.
   *
   * Note: to register for A2P 10DLC, select `CBN` — `CCN` is no longer
   * accepted by Twilio for Canadian registrations.
   */
  export enum BusinessRegistrationIdentifier {
    ein = 'EIN',
    duns = 'DUNS',
    // NOTE : to register for A2P 10DLC, you must select CBN because CCN is no longer accepted.
    ccn = 'CCN',
    cbn = 'CBN',
    cn = 'CN',
    acn = 'ACN',
    cin = 'CIN',
    vat = 'VAT',
    vatrn = 'VATRN',
    rn = 'RN',
    other = 'OTHER',
  }

  // StockExchange accepted values:
  // NONE, NASDAQ, NYSE, AMEX, AMX, ASX, B3, BME, BSE, FRA, ICEX, JPX, JSE, KRX, LON, NSE, OMX, SEHK, SGX, SSE, STO, SWX, SZSE, TSX, TWSE, VSE, OTHER
  /**
   * Stock exchange on which the account's parent company is listed, submitted
   * to Twilio for brand registration of publicly traded entities.
   *
   * Use `StockExchange.none` for privately held companies. The full list of
   * accepted exchange codes is documented in the inline comment above this
   * enum.
   */
  export enum StockExchange {
    none = 'NONE',
    nasdaq = 'NASDAQ',
    nyse = 'NYSE',
    amex = 'AMEX',
    amx = 'AMX',
    asx = 'ASX',
    b3 = 'B3',
    bme = 'BME',
    bse = 'BSE',
    fra = 'FRA',
    icex = 'ICEX',
    jpx = 'JPX',
    jse = 'JSE',
    krx = 'KRX',
    lon = 'LON',
    nse = 'NSE',
    omx = 'OMX',
    sehk = 'SEHK',
    sgx = 'SGX',
    sse = 'SSE',
    sto = 'STO',
    swx = 'SWX',
    szse = 'SZSE',
    tsx = 'TSX',
    twse = 'TWSE',
    vse = 'VSE',
    other = 'OTHER',
  }

  // us_app_to_person_usecase accepted values:
  // 2FA, ACCOUNT_NOTIFICATION, AGENTS_FRANCHISES, CHARITY, PROXY, CUSTOMER_CARE, DELIVERY_NOTIFICATION, EMERGENCY, FRAUD_ALERT, HIGHER_EDUCATION, K12_EDUCATION, LOW_VOLUME, MARKETING, MIXED, POLITICAL, PUBLIC_SERVICE_ANNOUNCEMENT, SECURITY_ALERT, SOCIAL, SWEEPSTAKE
  /**
   * Declared use-case category submitted to Twilio for A2P 10DLC campaign
   * registration (`us_app_to_person_usecase` field).
   *
   * The selected use case must accurately describe the messages that will be
   * sent; Twilio and Campaign Verify use this to approve or deny the campaign.
   * The full list of accepted values is documented in the inline comment above
   * this enum.
   */
  export enum AppToPersonUseCase {
    twoFactorAuthentication = '2FA',
    accountNotification = 'ACCOUNT_NOTIFICATION',
    agentsFranchises = 'AGENTS_FRANCHISES',
    charity = 'CHARITY',
    proxy = 'PROXY',
    customerCare = 'CUSTOMER_CARE',
    deliveryNotification = 'DELIVERY_NOTIFICATION',
    emergency = 'EMERGENCY',
    fraudAlert = 'FRAUD_ALERT',
    higherEducation = 'HIGHER_EDUCATION',
    k12Education = 'K12_EDUCATION',
    lowVolume = 'LOW_VOLUME',
    marketing = 'MARKETING',
    mixed = 'MIXED',
    political = 'POLITICAL',
    publicServiceAnnouncement = 'PUBLIC_SERVICE_ANNOUNCEMENT',
    securityAlert = 'SECURITY_ALERT',
    social = 'SOCIAL',
    sweepstake = 'SWEEPSTAKE',
  }

  /**
   * Social and web links, derived from the shared-helpers `User.InterfaceLinks`
   * definition with every member additionally permitted to be `null`.
   *
   * Declared as a mapped type over `User.InterfaceLinks` rather than as a
   * hand-written copy, so a member added or renamed upstream appears here
   * automatically and this type cannot drift from the definition it is derived
   * from. The runtime schema is a separate hand-written copy and *can* drift;
   * {@link LinksKeysCovered} is what catches that.
   *
   * The `| null` is what the stored documents actually require. A link that has
   * never been filled in is written as an explicit `null` rather than omitted,
   * and `User.InterfaceLinks` alone cannot describe that — which is also why
   * this type exists rather than the field being declared `User.InterfaceLinks`
   * directly.
   */
  export type Links = {[TMember in keyof User.InterfaceLinks]?: User.InterfaceLinks[TMember] | null};

  /**
   * Firestore document shape for a Furcata account.
   *
   * Extends {@link BaseFirestore} for auditing fields and {@link MessageQueue}
   * for real-time queue counters. This document is the central record for an
   * organisation on the platform. Cloud Functions read it to drive Twilio brand
   * and campaign registration, enforce messaging queue limits, manage billing
   * via Stripe Connected Accounts, and control domain-based authentication.
   */
  export interface Interface extends BaseFirestore, MessageQueue {
    /**
     * Preferred language.
     */
    language?: string | null;
    /**
     * Image path.
     */
    image?: string | null;
    /**
     * Full image URL for quick use.
     */
    imageURL?: string | null;
    /**
     * Account name.
     * It should be the legal name or in case of sending on behalf an eleted official, use that name
     */
    name?: string | null;
    /**
     * Legal business name.
     */
    businessName?: string | null;
    /**
     * The name to use.
     * Examples:
     * If name and businessName match: businessName
     * If they don't match: businessName (name)
     * This works for example in case of registering a government organization that sends on behalf of elected official
     */
    useName?: string | null;
    /**
     * Public site description.
     */
    description?: string | null;
    /**
     * Current lifecycle status of the account; see {@link Status} for accepted
     * values.
     */
    status?: Status | null;
    /**
     * Organisation classification; see {@link Type} for accepted values.
     */
    type?: Type | null;
    /**
     * Firebase Auth UID of the account owner.
     */
    uid?: string | null;
    /**
     * Social and web links associated with the account, sourced from the
     * shared-helpers `User.InterfaceLinks` definition; see {@link Links} for why
     * the field is declared through a mapped type rather than as
     * `User.InterfaceLinks` directly.
     */
    links?: Links | null,
    // Registration
    /**
     * Legal company structure; see {@link CompanyType} for accepted values.
     * Submitted to Twilio during brand registration.
     */
    companyType?: CompanyType | null;
    /**
     * Stock exchange on which the company is listed; see {@link StockExchange}
     * for accepted values. Use `NONE` for private companies.
     */
    stockExchange?: StockExchange | null;
    /**
     * Ticker symbol of the company on the `stockExchange`, if publicly traded.
     */
    stockTicker?: string | null;
    /**
     * Legal form of the business entity; see {@link BusinessType} for accepted
     * values.
     */
    businessType?: BusinessType | null;
    /**
     * Regions where the account operates; see {@link BusinessRegionsOfOperations}
     * for accepted values.
     */
    businessRegionsOfOperations?: BusinessRegionsOfOperations | null;
    /**
     * Type of government-issued registration number provided; see
     * {@link BusinessRegistrationIdentifier} for accepted values. Must be
     * sent to Twilio in uppercase.
     */
    businessRegistrationIdentifier?: BusinessRegistrationIdentifier | null;
    /**
     * Primary industry of the account; see {@link BusinessIndustry} for
     * accepted values.
     */
    businessIndustry?: BusinessIndustry | null;
    /**
     * Government-issued business registration number corresponding to the
     * `businessRegistrationIdentifier` type (e.g., EIN, DUNS).
     */
    businessRegistrationNumber?: string | null;
    /**
     * Primary authorised representative for Twilio brand registration.
     */
    authorizedRepresentative1?: AuthorizedRepresentative | null;
    /**
     * Secondary authorised representative for Twilio brand registration
     * (optional).
     */
    authorizedRepresentative2?: AuthorizedRepresentative | null;
    /**
     * Estimated monthly message volume used to auto-select the appropriate
     * `brandType` for Twilio A2P 10DLC registration.
     */
    estimatedVolume?: number | null;
    /**
     * Twilio brand tier derived from `estimatedVolume`; see {@link BrandType}
     * for accepted values.
     */
    brandType?: BrandType | null;
    /**
     * A2P 10DLC campaign use case; see {@link AppToPersonUseCase} for accepted
     * values. Submitted to Twilio during campaign registration.
     */
    appToPersonUseCase?: AppToPersonUseCase | null;
    /**
     * Declared use-case description for toll-free number campaign registration.
     */
    tollFreeUseCase?: string | null;
    /**
     * Detailed description of the use case to use on the 10DLC registration and for Twilio to understand the use case and be able to approve it.
     */
    useCaseDescription?: string | null;
    /**
     * Shorter and to the point to use on the opt-in consent.
     */
    useCaseDescriptionCTA?: string | null;
    /**
     * This is used to turn on/off the automatic header that is added to the top of the message for compliance reasons.
     * This is a custom feature for bulk and test messages in case the customer wants to use their own header or put the identification on the footer.
     * This should not be used for transactional messages.
     */
    automaticHeader?: boolean | null;

    // Address
    /**
     * Postal or ZIP code of the account's registered business address.
     */
    postalCode?: string | null;
    /**
     * Administrative region (state/province) of the business address.
     */
    area?: string | null; // Region
    /**
     * City of the business address.
     */
    city?: string | null;
    /**
     * First line of the street address.
     */
    street1?: string | null;
    /**
     * Second line of the street address (suite, floor, etc.).
     */
    street2?: string | null;
    /**
     * ISO 3166-1 alpha-2 country code for the business address (e.g., `"US"`).
     */
    country?: string | null;
    /**
     * UTC offset in minutes for the place's local timezone.
     */
    utcOffset?: number | null;
    // Domain
    /**
     * Custom domain associated with this account (e.g., `"example.com"`), used
     * for domain-based authentication and white-labelling.
     */
    domain?: string | null;
    /**
     * When `true`, the `domain` value has been verified and is active for
     * routing.
     */
    domainOk?: boolean | null;
    /**
     * Timestamp recording when the domain was last verified or checked.
     */
    domainTimestamp?: any;
    /**
     * Short alphanumeric alias for this account used in public-facing URLs
     * and API routes.
     */
    alias?: string | null;
    // Sample Messages
    /**
     * First sample message submitted to Twilio during A2P 10DLC campaign
     * registration to demonstrate the type of content that will be sent.
     */
    sampleMessage1?: string | null;
    /**
     * Second sample message for Twilio campaign registration.
     */
    sampleMessage2?: string | null;
    /**
     * Third sample message for Twilio campaign registration.
     */
    sampleMessage3?: string | null;
    /**
     * Fourth sample message for Twilio campaign registration.
     */
    sampleMessage4?: string | null;
    /**
     * Fifth sample message for Twilio campaign registration.
     */
    sampleMessage5?: string | null;
    // Billing
    /**
     * Stripe Connected Account ID used for billing and payment processing on
     * behalf of this account.
     */
    bca?: string | null; // Billing Connected Account
  }

  /**
   * Schema for {@link AuthorizedRepresentative}.
   *
   * Every field is optional because brand registration is filled in
   * progressively and a partially completed representative is a legitimate
   * stored state. {@link AuthorizedRepresentative.jobPosition} is validated
   * against its enum rather than asserted into it, because an unrecognised
   * seniority is rejected by the downstream registration API anyway — failing
   * here costs a validation error, failing there costs a registration round
   * trip.
   */
  const authorizedRepresentativeSchema = z.looseObject({
    /**
     * See {@link AuthorizedRepresentative.firstName}.
     */
    firstName: z.string().nullish(),
    /**
     * See {@link AuthorizedRepresentative.lastName}.
     */
    lastName: z.string().nullish(),
    /**
     * See {@link AuthorizedRepresentative.email}.
     */
    email: z.string().nullish(),
    /**
     * See {@link AuthorizedRepresentative.phoneNumber}.
     */
    phoneNumber: z.string().nullish(),
    /**
     * See {@link AuthorizedRepresentative.businessTitle}.
     */
    businessTitle: z.string().nullish(),
    /**
     * See {@link AuthorizedRepresentative.jobPosition}.
     */
    jobPosition: z.enum(AuthorizedRepresentativeJobPosition).nullish(),
  });

  /**
   * Schema for the social and web links block sourced from the shared-helpers
   * `User.InterfaceLinks` definition.
   *
   * Declared here rather than imported because that package ships types only.
   * {@link LinksKeysCovered} below is what keeps this copy honest — **not** the
   * compile-time proof on {@link Schema}, which cannot see a member added
   * upstream. `z.looseObject` infers a `[x: string]: unknown` index signature,
   * and an index signature on the source of an assignment does not supply named
   * members to satisfy an optional property on the target, so a new upstream
   * `mastodon?: string` is simply read as absent-and-optional and checks clean.
   * That was measured, by adding a member upstream and observing the build stay
   * green.
   */
  const linksSchema = z.looseObject({
    /**
     * Behance profile URL.
     */
    behance: z.string().nullish(),
    /**
     * Dribbble profile URL.
     */
    dribbble: z.string().nullish(),
    /**
     * Facebook page or profile URL.
     */
    facebook: z.string().nullish(),
    /**
     * Instagram profile URL.
     */
    instagram: z.string().nullish(),
    /**
     * LinkedIn profile URL.
     */
    linkedin: z.string().nullish(),
    /**
     * TikTok profile URL.
     */
    tiktok: z.string().nullish(),
    /**
     * X profile URL.
     */
    x: z.string().nullish(),
    /**
     * YouTube channel URL.
     */
    youtube: z.string().nullish(),
    /**
     * Primary website URL.
     */
    website: z.string().nullish(),
  });

  /**
   * Compile-time proof that {@link linksSchema} declares a field for **every**
   * member of the shared-helpers `User.InterfaceLinks` definition.
   *
   * This is the drift detector for the hand-maintained copy above, and it is
   * separate from {@link SchemaOutput} because the two catch opposite failures.
   * `SchemaOutput` compares inferred *values* and so catches this copy declaring
   * a member with the wrong type; it is structurally blind to a member that is
   * missing here, because an absent optional property is a legal shape. This
   * alias compares *keys*, so a member added or renamed upstream and not
   * followed here is a build failure naming the member.
   *
   * Verified by adding a member to the upstream definition and observing this
   * alias turn red while everything else stayed green.
   */
  export type LinksKeysCovered = AssertSchemaOutput<keyof User.InterfaceLinks, keyof typeof linksSchema.shape>;

  /**
   * Runtime schema producing {@link Interface}.
   *
   * This is the parse boundary for an account document, and it is where the
   * compliance enums stop being a suggestion. Every one of the brand and
   * campaign registration fields below is a closed set defined by a downstream
   * provider API: asserting an unrecognised value into {@link BusinessIndustry}
   * or {@link AppToPersonUseCase} with a cast does not produce a mislabelled
   * account, it produces a registration submission that is rejected after the
   * fact, by which point the failure is several systems away from the value that
   * caused it.
   *
   * The queue counters are spread from `messageQueueShape` and the audit fields
   * from `baseFirestoreShape`, so all three shapes stay validated identically
   * everywhere rather than drifting between hand-written copies.
   *
   * Unknown keys are preserved, matching the `[x: string]: any` index signature
   * inherited from {@link BaseFirestore}.
   *
   * Every optional field is `.nullish()` rather than `.optional()`. A stored
   * account is filled in progressively and its unfilled registration fields are
   * written as an explicit `null` rather than omitted, so a schema accepting
   * only `undefined` rejected substantially every stored account rather than an
   * unusual one. The loosening is bounded to `null` alone: an unrecognised enum
   * member, a wrong type and an out-of-range offset are all still rejected, as
   * are `null` on {@link Interface.domainTimestamp} and on the audit timestamps.
   *
   * Stored accounts also carry place fields — `geohash`, `latitude`,
   * `longitude`, `placeId` — that {@link Interface} does not declare. They pass
   * through as unknown keys and are preserved rather than rejected, so they are
   * unaffected by any of the above. Whether they should be modelled here, most
   * likely by spreading `basePlaceDataShape`, is a separate question for the
   * owner of this shape and is deliberately not answered by this schema.
   */
  export const Schema = z.looseObject({
    ...baseFirestoreShape,
    ...messageQueueShape,
    /**
     * See {@link Interface.language}.
     */
    language: nonEmptyString().nullish(),
    /**
     * See {@link Interface.image}.
     */
    image: nonEmptyString().nullish(),
    /**
     * See {@link Interface.imageURL}.
     */
    imageURL: nonEmptyString().nullish(),
    /**
     * See {@link Interface.name}.
     */
    name: z.string().nullish(),
    /**
     * See {@link Interface.businessName}.
     */
    businessName: z.string().nullish(),
    /**
     * See {@link Interface.useName}.
     */
    useName: z.string().nullish(),
    /**
     * See {@link Interface.description}.
     */
    description: z.string().nullish(),
    /**
     * See {@link Interface.status}. Validated against {@link Status}: this field
     * gates whether the message queue runs at all, so a value that is neither a
     * known status nor `paused` fails open and keeps sending.
     */
    status: z.enum(Status).nullish(),
    /**
     * See {@link Interface.type}.
     */
    type: z.enum(Type).nullish(),
    /**
     * See {@link Interface.uid}.
     */
    uid: nonEmptyString().nullish(),
    /**
     * See {@link Interface.links}.
     */
    links: linksSchema.nullish(),
    /**
     * See {@link Interface.companyType}.
     */
    companyType: z.enum(CompanyType).nullish(),
    /**
     * See {@link Interface.stockExchange}.
     */
    stockExchange: z.enum(StockExchange).nullish(),
    /**
     * See {@link Interface.stockTicker}.
     */
    stockTicker: z.string().nullish(),
    /**
     * See {@link Interface.businessType}.
     */
    businessType: z.enum(BusinessType).nullish(),
    /**
     * See {@link Interface.businessRegionsOfOperations}.
     */
    businessRegionsOfOperations: z.enum(BusinessRegionsOfOperations).nullish(),
    /**
     * See {@link Interface.businessRegistrationIdentifier}.
     */
    businessRegistrationIdentifier: z.enum(BusinessRegistrationIdentifier).nullish(),
    /**
     * See {@link Interface.businessIndustry}.
     */
    businessIndustry: z.enum(BusinessIndustry).nullish(),
    /**
     * See {@link Interface.businessRegistrationNumber}.
     */
    businessRegistrationNumber: z.string().nullish(),
    /**
     * See {@link Interface.authorizedRepresentative1}.
     */
    authorizedRepresentative1: authorizedRepresentativeSchema.nullish(),
    /**
     * See {@link Interface.authorizedRepresentative2}.
     */
    authorizedRepresentative2: authorizedRepresentativeSchema.nullish(),
    /**
     * See {@link Interface.estimatedVolume}. A whole number of messages per
     * month; {@link Interface.brandType} is derived from it, so a value that
     * arrived as a string and became `NaN` would select a brand tier by
     * comparing `NaN` against every threshold and losing every comparison.
     */
    estimatedVolume: counter().nullish(),
    /**
     * See {@link Interface.brandType}.
     */
    brandType: z.enum(BrandType).nullish(),
    /**
     * See {@link Interface.appToPersonUseCase}.
     */
    appToPersonUseCase: z.enum(AppToPersonUseCase).nullish(),
    /**
     * See {@link Interface.tollFreeUseCase}.
     */
    tollFreeUseCase: z.string().nullish(),
    /**
     * See {@link Interface.useCaseDescription}.
     */
    useCaseDescription: z.string().nullish(),
    /**
     * See {@link Interface.useCaseDescriptionCTA}.
     */
    useCaseDescriptionCTA: z.string().nullish(),
    /**
     * See {@link Interface.automaticHeader}.
     */
    automaticHeader: z.boolean().nullish(),
    /**
     * See {@link Interface.postalCode}.
     */
    postalCode: z.string().nullish(),
    /**
     * See {@link Interface.area}.
     */
    area: z.string().nullish(),
    /**
     * See {@link Interface.city}.
     */
    city: z.string().nullish(),
    /**
     * See {@link Interface.street1}.
     */
    street1: z.string().nullish(),
    /**
     * See {@link Interface.street2}.
     */
    street2: z.string().nullish(),
    /**
     * See {@link Interface.country}.
     */
    country: z.string().nullish(),
    /**
     * See {@link Interface.utcOffset}. Whole minutes, not hours: offsets such as
     * `+05:45` are not expressible in whole hours at all, so an hours value
     * accepted here would be wrong by a factor of sixty.
     */
    utcOffset: z.int().min(-1440).max(1440).nullish(),
    /**
     * See {@link Interface.domain}.
     */
    domain: nonEmptyString().nullish(),
    /**
     * See {@link Interface.domainOk}.
     */
    domainOk: z.boolean().nullish(),
    /**
     * See {@link Interface.domainTimestamp}. Declared `any`; resolved at this
     * boundary by `auditTimestamp` rather than by a type that cannot name a
     * server sentinel.
     */
    domainTimestamp: auditTimestamp().optional(),
    /**
     * See {@link Interface.alias}.
     */
    alias: nonEmptyString().nullish(),
    /**
     * See {@link Interface.sampleMessage1}.
     */
    sampleMessage1: z.string().nullish(),
    /**
     * See {@link Interface.sampleMessage2}.
     */
    sampleMessage2: z.string().nullish(),
    /**
     * See {@link Interface.sampleMessage3}.
     */
    sampleMessage3: z.string().nullish(),
    /**
     * See {@link Interface.sampleMessage4}.
     */
    sampleMessage4: z.string().nullish(),
    /**
     * See {@link Interface.sampleMessage5}.
     */
    sampleMessage5: z.string().nullish(),
    /**
     * See {@link Interface.bca}.
     */
    bca: nonEmptyString().nullish(),
  });

  /**
   * Compile-time proof that {@link Schema} produces {@link Interface}.
   *
   * This compares inferred *values*, so it catches `linksSchema` declaring a
   * member of {@link Links} with the wrong type. It does **not** catch a member
   * added upstream that `linksSchema` never declared — an absent optional
   * property is a legal shape, so the check passes. {@link LinksKeysCovered}
   * covers that case; the two together are what pin this package to the
   * shared-helpers `User.InterfaceLinks` definition.
   */
  export type SchemaOutput = AssertSchemaOutput<z.infer<typeof Schema>, Interface>;

  /**
   * Validates untrusted data as an account document without throwing.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored account document.
   * @return {ParseResult<Interface>} Success carrying the typed account, or failure carrying the reasons.
   */
  export const safeParse = (value: unknown): ParseResult<Interface> => parseResult(Schema, value, 'Account.Interface');

  /**
   * Validates untrusted data as an account document, throwing when it does not
   * conform.
   *
   * @param {unknown} value - Untrusted value, typically the raw data of a stored account document.
   * @return {Interface} The validated account document.
   * @throws {ParseError} When the value does not conform to {@link Schema}.
   */
  export const parse = (value: unknown): Interface => parseOrThrow(Schema, value, 'Account.Interface');
}
