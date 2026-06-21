/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { User } from '@fabricelements/shared-helpers/user';
import { BaseFirestore } from '../interface/base_db.js';
import { MessageQueue } from '../interface/queue.js';
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
export declare namespace Account {
    /**
     * Lifecycle status of an account, used by Cloud Functions to gate access to
     * messaging services and queue processing.
     *
     * An account must be `active` for its message queue to run. Setting the
     * status to `paused` is the required mechanism for stopping the queue
     * without permanently deactivating the account.
     */
    enum Status {
        active = "active",
        inactive = "inactive",
        suspended = "suspended",
        paused = "paused",
        draft = "draft",
        review = "review"
    }
    /**
     * High-level classification of the account organisation type, used for
     * Twilio brand registration and compliance routing.
     */
    enum Type {
        business = "business",
        government = "government",
        nonProfit = "non_profit"
    }
    /**
     * Access-control role assigned to a user within an account, used by
     * Firestore security rules and Cloud Function permission checks.
     */
    enum Roles {
        agent = "agent",
        admin = "admin",
        owner = "owner",
        guest = "guest"
    }
    /**
     * Accepted job-position values for the authorised representative during
     * Twilio brand registration.
     */
    enum AuthorizedRepresentativeJobPosition {
        director = "Director",
        gm = "GM",
        vp = "VP",
        ceo = "CEO",
        cfo = "CFO",
        generalCounsel = "General Counsel",
        other = "Other"
    }
    /**
     * Contact and identity details for a person authorised to act on behalf of
     * the account during Twilio brand registration.
     *
     * Twilio requires at least one authorised representative; a second is
     * optional for additional verification.
     */
    interface AuthorizedRepresentative {
        /**
         * Representative's legal first name.
         */
        firstName?: string;
        /**
         * Representative's legal last name.
         */
        lastName?: string;
        /**
         * Representative's business email address.
         */
        email?: string;
        /**
         * Representative's direct phone number in E.164 format.
         */
        phoneNumber?: string;
        /**
         * Representative's business title as it appears on company documents.
         */
        businessTitle?: string;
        /**
         * Representative's seniority or functional role; see
         * {@link AuthorizedRepresentativeJobPosition} for accepted values.
         */
        jobPosition?: AuthorizedRepresentativeJobPosition;
    }
    /**
     * Twilio brand type required for A2P 10DLC registration; determined
     * automatically from the account's `estimatedVolume`.
     *
     * Accepted values for the Twilio API are `'SOLE_PROPRIETOR'`,
     * `'LOW_VOLUME_STANDARD'`, and `'STANDARD'`.
     */
    enum BrandType {
        soleProprietor = "SOLE_PROPRIETOR",
        lowVolumeStandard = "LOW_VOLUME_STANDARD",
        standard = "STANDARD"
    }
    /**
     * Legal structure classification of the company as required by Twilio's
     * brand registration API.
     *
     * Accepted values are `'public'`, `'private'`, `'non-profit'`, and
     * `'government'`.
     */
    enum CompanyType {
        public = "public",
        private = "private",
        nonProfit = "non-profit",
        government = "government"
    }
    /**
     * Legal form of the business entity as required by Twilio's brand
     * registration API.
     *
     * Accepted values are `'Sole Proprietorship'`, `'Partnership'`,
     * `'Limited Liability Corporation'`, `'Co-operative'`,
     * `'Non-profit Corporation'`, and `'Corporation'`.
     */
    enum BusinessType {
        soleProprietorship = "Sole Proprietorship",
        partnership = "Partnership",
        limitedLiabilityCorporation = "Limited Liability Corporation",
        coOperative = "Co-operative",
        nonProfitCorporation = "Non-profit Corporation",
        corporation = "Corporation"
    }
    /**
     * Primary industry vertical of the account, submitted to Twilio during
     * A2P 10DLC brand registration.
     *
     * The full list of accepted values is documented in the inline comment above
     * this enum.
     */
    enum BusinessIndustry {
        automotive = "AUTOMOTIVE",
        agriculture = "AGRICULTURE",
        banking = "BANKING",
        construction = "CONSTRUCTION",
        consumer = "CONSUMER",
        education = "EDUCATION",
        engineering = "ENGINEERING",
        energy = "ENERGY",
        oilAndGas = "OIL_AND_GAS",
        fastMovingConsumerGoods = "FAST_MOVING_CONSUMER_GOODS",
        financial = "FINANCIAL",
        fintech = "FINTECH",
        foodAndBeverage = "FOOD_AND_BEVERAGE",
        government = "GOVERNMENT",
        healthcare = "HEALTHCARE",
        hospitality = "HOSPITALITY",
        insurance = "INSURANCE",
        legal = "LEGAL",
        manufacturing = "MANUFACTURING",
        media = "MEDIA",
        online = "ONLINE",
        professionalServices = "PROFESSIONAL_SERVICES",
        rawMaterials = "RAW_MATERIALS",
        realEstate = "REAL_ESTATE",
        religion = "RELIGION",
        retail = "RETAIL",
        jewelry = "JEWELRY",
        technology = "TECHNOLOGY",
        telecommunications = "TELECOMMUNICATIONS",
        transportation = "TRANSPORTATION",
        travel = "TRAVEL",
        electronics = "ELECTRONICS",
        notForProfit = "NOT_FOR_PROFIT"
    }
    /**
     * Geographic regions where the account operates, submitted to Twilio during
     * A2P 10DLC brand registration.
     *
     * Accepted values are `'AFRICA'`, `'ASIA'`, `'EUROPE'`, `'LATIN_AMERICA'`,
     * `'USA_AND_CANADA'`, and `'AUSTRALIA'`.
     */
    enum BusinessRegionsOfOperations {
        africa = "AFRICA",
        asia = "ASIA",
        europe = "EUROPE",
        latinAmerica = "LATIN_AMERICA",
        usaAndCanada = "USA_AND_CANADA",
        australia = "AUSTRALIA"
    }
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
    enum BusinessRegistrationIdentifier {
        ein = "EIN",
        duns = "DUNS",
        ccn = "CCN",
        cbn = "CBN",
        cn = "CN",
        acn = "ACN",
        cin = "CIN",
        vat = "VAT",
        vatrn = "VATRN",
        rn = "RN",
        other = "OTHER"
    }
    /**
     * Stock exchange on which the account's parent company is listed, submitted
     * to Twilio for brand registration of publicly traded entities.
     *
     * Use `StockExchange.none` for privately held companies. The full list of
     * accepted exchange codes is documented in the inline comment above this
     * enum.
     */
    enum StockExchange {
        none = "NONE",
        nasdaq = "NASDAQ",
        nyse = "NYSE",
        amex = "AMEX",
        amx = "AMX",
        asx = "ASX",
        b3 = "B3",
        bme = "BME",
        bse = "BSE",
        fra = "FRA",
        icex = "ICEX",
        jpx = "JPX",
        jse = "JSE",
        krx = "KRX",
        lon = "LON",
        nse = "NSE",
        omx = "OMX",
        sehk = "SEHK",
        sgx = "SGX",
        sse = "SSE",
        sto = "STO",
        swx = "SWX",
        szse = "SZSE",
        tsx = "TSX",
        twse = "TWSE",
        vse = "VSE",
        other = "OTHER"
    }
    /**
     * Declared use-case category submitted to Twilio for A2P 10DLC campaign
     * registration (`us_app_to_person_usecase` field).
     *
     * The selected use case must accurately describe the messages that will be
     * sent; Twilio and Campaign Verify use this to approve or deny the campaign.
     * The full list of accepted values is documented in the inline comment above
     * this enum.
     */
    enum AppToPersonUseCase {
        twoFactorAuthentication = "2FA",
        accountNotification = "ACCOUNT_NOTIFICATION",
        agentsFranchises = "AGENTS_FRANCHISES",
        charity = "CHARITY",
        proxy = "PROXY",
        customerCare = "CUSTOMER_CARE",
        deliveryNotification = "DELIVERY_NOTIFICATION",
        emergency = "EMERGENCY",
        fraudAlert = "FRAUD_ALERT",
        higherEducation = "HIGHER_EDUCATION",
        k12Education = "K12_EDUCATION",
        lowVolume = "LOW_VOLUME",
        marketing = "MARKETING",
        mixed = "MIXED",
        political = "POLITICAL",
        publicServiceAnnouncement = "PUBLIC_SERVICE_ANNOUNCEMENT",
        securityAlert = "SECURITY_ALERT",
        social = "SOCIAL",
        sweepstake = "SWEEPSTAKE"
    }
    /**
     * Firestore document shape for a Furcata account.
     *
     * Extends {@link BaseFirestore} for auditing fields and {@link MessageQueue}
     * for real-time queue counters. This document is the central record for an
     * organisation on the platform. Cloud Functions read it to drive Twilio brand
     * and campaign registration, enforce messaging queue limits, manage billing
     * via Stripe Connected Accounts, and control domain-based authentication.
     */
    interface Interface extends BaseFirestore, MessageQueue {
        /**
         * Preferred language.
         */
        language?: string;
        /**
         * Image path.
         */
        image?: string;
        /**
         * Full image URL for quick use.
         */
        imageURL?: string;
        /**
         * Account name.
         * It should be the legal name or in case of sending on behalf an eleted official, use that name
         */
        name?: string;
        /**
         * Legal business name.
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
         * Public site description.
         */
        description?: string;
        /**
         * Current lifecycle status of the account; see {@link Status} for accepted
         * values.
         */
        status?: Status;
        /**
         * Organisation classification; see {@link Type} for accepted values.
         */
        type?: Type;
        /**
         * Firebase Auth UID of the account owner.
         */
        uid?: string;
        /**
         * Social and web links associated with the account, sourced from the
         * shared-helpers `User.InterfaceLinks` definition.
         */
        links?: User.InterfaceLinks;
        /**
         * Legal company structure; see {@link CompanyType} for accepted values.
         * Submitted to Twilio during brand registration.
         */
        companyType?: CompanyType;
        /**
         * Stock exchange on which the company is listed; see {@link StockExchange}
         * for accepted values. Use `NONE` for private companies.
         */
        stockExchange?: StockExchange;
        /**
         * Ticker symbol of the company on the `stockExchange`, if publicly traded.
         */
        stockTicker?: string;
        /**
         * Legal form of the business entity; see {@link BusinessType} for accepted
         * values.
         */
        businessType?: BusinessType;
        /**
         * Regions where the account operates; see {@link BusinessRegionsOfOperations}
         * for accepted values.
         */
        businessRegionsOfOperations?: BusinessRegionsOfOperations;
        /**
         * Type of government-issued registration number provided; see
         * {@link BusinessRegistrationIdentifier} for accepted values. Must be
         * sent to Twilio in uppercase.
         */
        businessRegistrationIdentifier?: BusinessRegistrationIdentifier;
        /**
         * Primary industry of the account; see {@link BusinessIndustry} for
         * accepted values.
         */
        businessIndustry?: BusinessIndustry;
        /**
         * Government-issued business registration number corresponding to the
         * `businessRegistrationIdentifier` type (e.g., EIN, DUNS).
         */
        businessRegistrationNumber?: string;
        /**
         * Primary authorised representative for Twilio brand registration.
         */
        authorizedRepresentative1?: AuthorizedRepresentative;
        /**
         * Secondary authorised representative for Twilio brand registration
         * (optional).
         */
        authorizedRepresentative2?: AuthorizedRepresentative;
        /**
         * Estimated monthly message volume used to auto-select the appropriate
         * `brandType` for Twilio A2P 10DLC registration.
         */
        estimatedVolume?: number;
        /**
         * Twilio brand tier derived from `estimatedVolume`; see {@link BrandType}
         * for accepted values.
         */
        brandType?: BrandType;
        /**
         * A2P 10DLC campaign use case; see {@link AppToPersonUseCase} for accepted
         * values. Submitted to Twilio during campaign registration.
         */
        appToPersonUseCase?: AppToPersonUseCase;
        /**
         * Declared use-case description for toll-free number campaign registration.
         */
        tollFreeUseCase?: string;
        /**
         * Detailed description of the use case to use on the 10DLC registration and for Twilio to understand the use case and be able to approve it.
         */
        useCaseDescription?: string;
        /**
         * Shorter and to the point to use on the opt-in consent.
         */
        useCaseDescriptionCTA?: string;
        /**
         * This is used to turn on/off the automatic header that is added to the top of the message for compliance reasons.
         * This is a custom feature for bulk and test messages in case the customer wants to use their own header or put the identification on the footer.
         * This should not be used for transactional messages.
         */
        automaticHeader?: boolean;
        /**
         * Postal or ZIP code of the account's registered business address.
         */
        postalCode?: string;
        /**
         * Administrative region (state/province) of the business address.
         */
        area?: string;
        /**
         * City of the business address.
         */
        city?: string;
        /**
         * First line of the street address.
         */
        street1?: string;
        /**
         * Second line of the street address (suite, floor, etc.).
         */
        street2?: string;
        /**
         * ISO 3166-1 alpha-2 country code for the business address (e.g., `"US"`).
         */
        country?: string;
        /**
         * UTC offset in minutes for the place's local timezone.
         */
        utcOffset?: number;
        /**
         * Custom domain associated with this account (e.g., `"example.com"`), used
         * for domain-based authentication and white-labelling.
         */
        domain?: string;
        /**
         * When `true`, the `domain` value has been verified and is active for
         * routing.
         */
        domainOk?: boolean;
        /**
         * Timestamp recording when the domain was last verified or checked.
         */
        domainTimestamp?: any;
        /**
         * Short alphanumeric alias for this account used in public-facing URLs
         * and API routes.
         */
        alias?: string;
        /**
         * First sample message submitted to Twilio during A2P 10DLC campaign
         * registration to demonstrate the type of content that will be sent.
         */
        sampleMessage1?: string;
        /**
         * Second sample message for Twilio campaign registration.
         */
        sampleMessage2?: string;
        /**
         * Third sample message for Twilio campaign registration.
         */
        sampleMessage3?: string;
        /**
         * Fourth sample message for Twilio campaign registration.
         */
        sampleMessage4?: string;
        /**
         * Fifth sample message for Twilio campaign registration.
         */
        sampleMessage5?: string;
        /**
         * Stripe Connected Account ID used for billing and payment processing on
         * behalf of this account.
         */
        bca?: string;
    }
}
