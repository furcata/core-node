/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import {User} from '@fabricelements/shared-helpers/user';
import {BaseFirestore} from '../interface/base_db.js';
import {MessageQueue} from '../interface/queue.js';

/**
 * Account
 */
export namespace Account {
  export enum Status {
    active = 'active',
    inactive = 'inactive',
    suspended = 'suspended',
    // The user should pause the account to be able to stop the queue
    paused = 'paused',
    draft = 'draft',
    review = 'review',
  }

  export enum Type {
    business = 'business',
    government = 'government',
    nonProfit = 'non_profit',
  }

  export enum Roles {
    agent = 'agent',
    admin = 'admin',
    owner = 'owner',
    guest = 'guest',
  }

  export enum AuthorizedRepresentativeJobPosition {
    director = 'Director',
    gm = 'GM',
    vp = 'VP',
    ceo = 'CEO',
    cfo = 'CFO',
    generalCounsel = 'General Counsel',
    other = 'Other',
  }

  export interface AuthorizedRepresentative {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    businessTitle?: string;
    jobPosition?: AuthorizedRepresentativeJobPosition;
  }

  // This is required for Twilio brand registration. Must be calculated depending on the estimatedVolume.
  // brand_type accepted values: 'SOLE_PROPRIETOR', 'LOW_VOLUME_STANDARD', 'STANDARD'
  export enum BrandType {
    /// SOLE_PROPRIETOR is only available for the US, but we don't use it
    soleProprietor = 'SOLE_PROPRIETOR',
    lowVolumeStandard = 'LOW_VOLUME_STANDARD',
    standard = 'STANDARD',
  }

  // company_type accepted values: 'public','private','non-profit','government'
  export enum CompanyType {
    public = 'public',
    private = 'private',
    nonProfit = 'non-profit',
    government = 'government',
  }

  // BusinessType accepted values:
  // 'Sole Proprietorship', 'Partnership', 'Limited Liability Corporation', 'Co-operative', 'Non-profit Corporation', 'Corporation'
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
   * Account
   */
  export interface Interface extends BaseFirestore, MessageQueue {
    /**
     * Preferred language
     */
    language?: string;
    /**
     * Image path
     */
    image?: string;
    /**
     * Full image url for quick use
     */
    imageURL?: string;
    /**
     * Account Name
     * It should be the legal name or in case of sending on behalf an eleted official, use that name
     */
    name?: string;
    /**
     * Legal Business name
     */
    businessName?: string;
    /**
     * The name to use.
     * Examples:
     * If name and businessName match: businessName
     * If they don't match: businessName (name)
     * This works for example in case of registering a government organization that sends on behalf of elected official
     */
    useName?: string;
    /**
     * Public site description
     */
    description?: string;
    status?: Status;
    type?: Type;
    uid?: string;
    links?: User.InterfaceLinks,
    // Registration
    companyType?: CompanyType;
    stockExchange?: StockExchange;
    stockTicker?: string;
    businessType?: BusinessType;
    businessRegionsOfOperations?: BusinessRegionsOfOperations;
    businessRegistrationIdentifier?: BusinessRegistrationIdentifier;
    businessIndustry?: BusinessIndustry;
    businessRegistrationNumber?: string;
    authorizedRepresentative1?: AuthorizedRepresentative;
    authorizedRepresentative2?: AuthorizedRepresentative;
    estimatedVolume?: number;
    brandType?: BrandType;
    appToPersonUseCase?: AppToPersonUseCase;
    tollFreeUseCase?: string;
    /**
     * Detailed description of the use case to use on the 10DLC registration and for Twilio to understand the use case and be able to approve it.
     */
    useCaseDescription?: string;
    /**
     * Shorter and to the point to use on the opt-in consent
     */
    useCaseDescriptionCTA?: string;
    /**
     * This is used to skip the automatic header that is added to the top of the message for compliance reasons.
     * This is a custom feature for bulk and test messages in case the customer wants to use their own header or put the identification on the footer.
     * This should not be used for regular messages.
     */
    skipAutomaticHeader?: boolean;
    // Address
    postalCode?: string;
    area?: string; // Region
    city?: string;
    street1?: string;
    street2?: string;
    country?: string;
    // Domain
    domain?: string;
    domainOk?: boolean;
    domainTimestamp?: any;
    alias?: string;
    // Sample Messages
    sampleMessage1?: string;
    sampleMessage2?: string;
    sampleMessage3?: string;
    sampleMessage4?: string;
    sampleMessage5?: string;
    // Billing
    bca?: string; // Billing Connected Account
  }
}
