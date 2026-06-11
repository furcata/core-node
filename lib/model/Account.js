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
export var Account;
(function (Account) {
    /**
     * Lifecycle status of an account, used by Cloud Functions to gate access to
     * messaging services and queue processing.
     *
     * An account must be `active` for its message queue to run. Setting the
     * status to `paused` is the required mechanism for stopping the queue
     * without permanently deactivating the account.
     */
    let Status;
    (function (Status) {
        Status["active"] = "active";
        Status["inactive"] = "inactive";
        Status["suspended"] = "suspended";
        // The user should pause the account to be able to stop the queue
        Status["paused"] = "paused";
        Status["draft"] = "draft";
        Status["review"] = "review";
    })(Status = Account.Status || (Account.Status = {}));
    /**
     * High-level classification of the account organisation type, used for
     * Twilio brand registration and compliance routing.
     */
    let Type;
    (function (Type) {
        Type["business"] = "business";
        Type["government"] = "government";
        Type["nonProfit"] = "non_profit";
    })(Type = Account.Type || (Account.Type = {}));
    /**
     * Access-control role assigned to a user within an account, used by
     * Firestore security rules and Cloud Function permission checks.
     */
    let Roles;
    (function (Roles) {
        Roles["agent"] = "agent";
        Roles["admin"] = "admin";
        Roles["owner"] = "owner";
        Roles["guest"] = "guest";
    })(Roles = Account.Roles || (Account.Roles = {}));
    /**
     * Accepted job-position values for the authorised representative during
     * Twilio brand registration.
     */
    let AuthorizedRepresentativeJobPosition;
    (function (AuthorizedRepresentativeJobPosition) {
        AuthorizedRepresentativeJobPosition["director"] = "Director";
        AuthorizedRepresentativeJobPosition["gm"] = "GM";
        AuthorizedRepresentativeJobPosition["vp"] = "VP";
        AuthorizedRepresentativeJobPosition["ceo"] = "CEO";
        AuthorizedRepresentativeJobPosition["cfo"] = "CFO";
        AuthorizedRepresentativeJobPosition["generalCounsel"] = "General Counsel";
        AuthorizedRepresentativeJobPosition["other"] = "Other";
    })(AuthorizedRepresentativeJobPosition = Account.AuthorizedRepresentativeJobPosition || (Account.AuthorizedRepresentativeJobPosition = {}));
    // This is required for Twilio brand registration. Must be calculated depending on the estimatedVolume.
    // brand_type accepted values: 'SOLE_PROPRIETOR', 'LOW_VOLUME_STANDARD', 'STANDARD'
    /**
     * Twilio brand type required for A2P 10DLC registration; determined
     * automatically from the account's `estimatedVolume`.
     *
     * Accepted values for the Twilio API are `'SOLE_PROPRIETOR'`,
     * `'LOW_VOLUME_STANDARD'`, and `'STANDARD'`.
     */
    let BrandType;
    (function (BrandType) {
        /// SOLE_PROPRIETOR is only available for the US, but we don't use it
        BrandType["soleProprietor"] = "SOLE_PROPRIETOR";
        BrandType["lowVolumeStandard"] = "LOW_VOLUME_STANDARD";
        BrandType["standard"] = "STANDARD";
    })(BrandType = Account.BrandType || (Account.BrandType = {}));
    // company_type accepted values: 'public','private','non-profit','government'
    /**
     * Legal structure classification of the company as required by Twilio's
     * brand registration API.
     *
     * Accepted values are `'public'`, `'private'`, `'non-profit'`, and
     * `'government'`.
     */
    let CompanyType;
    (function (CompanyType) {
        CompanyType["public"] = "public";
        CompanyType["private"] = "private";
        CompanyType["nonProfit"] = "non-profit";
        CompanyType["government"] = "government";
    })(CompanyType = Account.CompanyType || (Account.CompanyType = {}));
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
    let BusinessType;
    (function (BusinessType) {
        BusinessType["soleProprietorship"] = "Sole Proprietorship";
        BusinessType["partnership"] = "Partnership";
        BusinessType["limitedLiabilityCorporation"] = "Limited Liability Corporation";
        BusinessType["coOperative"] = "Co-operative";
        BusinessType["nonProfitCorporation"] = "Non-profit Corporation";
        BusinessType["corporation"] = "Corporation";
    })(BusinessType = Account.BusinessType || (Account.BusinessType = {}));
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
    let BusinessIndustry;
    (function (BusinessIndustry) {
        BusinessIndustry["automotive"] = "AUTOMOTIVE";
        BusinessIndustry["agriculture"] = "AGRICULTURE";
        BusinessIndustry["banking"] = "BANKING";
        BusinessIndustry["construction"] = "CONSTRUCTION";
        BusinessIndustry["consumer"] = "CONSUMER";
        BusinessIndustry["education"] = "EDUCATION";
        BusinessIndustry["engineering"] = "ENGINEERING";
        BusinessIndustry["energy"] = "ENERGY";
        BusinessIndustry["oilAndGas"] = "OIL_AND_GAS";
        BusinessIndustry["fastMovingConsumerGoods"] = "FAST_MOVING_CONSUMER_GOODS";
        BusinessIndustry["financial"] = "FINANCIAL";
        BusinessIndustry["fintech"] = "FINTECH";
        BusinessIndustry["foodAndBeverage"] = "FOOD_AND_BEVERAGE";
        BusinessIndustry["government"] = "GOVERNMENT";
        BusinessIndustry["healthcare"] = "HEALTHCARE";
        BusinessIndustry["hospitality"] = "HOSPITALITY";
        BusinessIndustry["insurance"] = "INSURANCE";
        BusinessIndustry["legal"] = "LEGAL";
        BusinessIndustry["manufacturing"] = "MANUFACTURING";
        BusinessIndustry["media"] = "MEDIA";
        BusinessIndustry["online"] = "ONLINE";
        BusinessIndustry["professionalServices"] = "PROFESSIONAL_SERVICES";
        BusinessIndustry["rawMaterials"] = "RAW_MATERIALS";
        BusinessIndustry["realEstate"] = "REAL_ESTATE";
        BusinessIndustry["religion"] = "RELIGION";
        BusinessIndustry["retail"] = "RETAIL";
        BusinessIndustry["jewelry"] = "JEWELRY";
        BusinessIndustry["technology"] = "TECHNOLOGY";
        BusinessIndustry["telecommunications"] = "TELECOMMUNICATIONS";
        BusinessIndustry["transportation"] = "TRANSPORTATION";
        BusinessIndustry["travel"] = "TRAVEL";
        BusinessIndustry["electronics"] = "ELECTRONICS";
        BusinessIndustry["notForProfit"] = "NOT_FOR_PROFIT";
    })(BusinessIndustry = Account.BusinessIndustry || (Account.BusinessIndustry = {}));
    // BusinessRegionsOfOperations accepted values:
    // 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'USA_AND_CANADA', 'AUSTRALIA'
    /**
     * Geographic regions where the account operates, submitted to Twilio during
     * A2P 10DLC brand registration.
     *
     * Accepted values are `'AFRICA'`, `'ASIA'`, `'EUROPE'`, `'LATIN_AMERICA'`,
     * `'USA_AND_CANADA'`, and `'AUSTRALIA'`.
     */
    let BusinessRegionsOfOperations;
    (function (BusinessRegionsOfOperations) {
        BusinessRegionsOfOperations["africa"] = "AFRICA";
        BusinessRegionsOfOperations["asia"] = "ASIA";
        BusinessRegionsOfOperations["europe"] = "EUROPE";
        BusinessRegionsOfOperations["latinAmerica"] = "LATIN_AMERICA";
        BusinessRegionsOfOperations["usaAndCanada"] = "USA_AND_CANADA";
        BusinessRegionsOfOperations["australia"] = "AUSTRALIA";
    })(BusinessRegionsOfOperations = Account.BusinessRegionsOfOperations || (Account.BusinessRegionsOfOperations = {}));
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
    let BusinessRegistrationIdentifier;
    (function (BusinessRegistrationIdentifier) {
        BusinessRegistrationIdentifier["ein"] = "EIN";
        BusinessRegistrationIdentifier["duns"] = "DUNS";
        // NOTE : to register for A2P 10DLC, you must select CBN because CCN is no longer accepted.
        BusinessRegistrationIdentifier["ccn"] = "CCN";
        BusinessRegistrationIdentifier["cbn"] = "CBN";
        BusinessRegistrationIdentifier["cn"] = "CN";
        BusinessRegistrationIdentifier["acn"] = "ACN";
        BusinessRegistrationIdentifier["cin"] = "CIN";
        BusinessRegistrationIdentifier["vat"] = "VAT";
        BusinessRegistrationIdentifier["vatrn"] = "VATRN";
        BusinessRegistrationIdentifier["rn"] = "RN";
        BusinessRegistrationIdentifier["other"] = "OTHER";
    })(BusinessRegistrationIdentifier = Account.BusinessRegistrationIdentifier || (Account.BusinessRegistrationIdentifier = {}));
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
    let StockExchange;
    (function (StockExchange) {
        StockExchange["none"] = "NONE";
        StockExchange["nasdaq"] = "NASDAQ";
        StockExchange["nyse"] = "NYSE";
        StockExchange["amex"] = "AMEX";
        StockExchange["amx"] = "AMX";
        StockExchange["asx"] = "ASX";
        StockExchange["b3"] = "B3";
        StockExchange["bme"] = "BME";
        StockExchange["bse"] = "BSE";
        StockExchange["fra"] = "FRA";
        StockExchange["icex"] = "ICEX";
        StockExchange["jpx"] = "JPX";
        StockExchange["jse"] = "JSE";
        StockExchange["krx"] = "KRX";
        StockExchange["lon"] = "LON";
        StockExchange["nse"] = "NSE";
        StockExchange["omx"] = "OMX";
        StockExchange["sehk"] = "SEHK";
        StockExchange["sgx"] = "SGX";
        StockExchange["sse"] = "SSE";
        StockExchange["sto"] = "STO";
        StockExchange["swx"] = "SWX";
        StockExchange["szse"] = "SZSE";
        StockExchange["tsx"] = "TSX";
        StockExchange["twse"] = "TWSE";
        StockExchange["vse"] = "VSE";
        StockExchange["other"] = "OTHER";
    })(StockExchange = Account.StockExchange || (Account.StockExchange = {}));
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
    let AppToPersonUseCase;
    (function (AppToPersonUseCase) {
        AppToPersonUseCase["twoFactorAuthentication"] = "2FA";
        AppToPersonUseCase["accountNotification"] = "ACCOUNT_NOTIFICATION";
        AppToPersonUseCase["agentsFranchises"] = "AGENTS_FRANCHISES";
        AppToPersonUseCase["charity"] = "CHARITY";
        AppToPersonUseCase["proxy"] = "PROXY";
        AppToPersonUseCase["customerCare"] = "CUSTOMER_CARE";
        AppToPersonUseCase["deliveryNotification"] = "DELIVERY_NOTIFICATION";
        AppToPersonUseCase["emergency"] = "EMERGENCY";
        AppToPersonUseCase["fraudAlert"] = "FRAUD_ALERT";
        AppToPersonUseCase["higherEducation"] = "HIGHER_EDUCATION";
        AppToPersonUseCase["k12Education"] = "K12_EDUCATION";
        AppToPersonUseCase["lowVolume"] = "LOW_VOLUME";
        AppToPersonUseCase["marketing"] = "MARKETING";
        AppToPersonUseCase["mixed"] = "MIXED";
        AppToPersonUseCase["political"] = "POLITICAL";
        AppToPersonUseCase["publicServiceAnnouncement"] = "PUBLIC_SERVICE_ANNOUNCEMENT";
        AppToPersonUseCase["securityAlert"] = "SECURITY_ALERT";
        AppToPersonUseCase["social"] = "SOCIAL";
        AppToPersonUseCase["sweepstake"] = "SWEEPSTAKE";
    })(AppToPersonUseCase = Account.AppToPersonUseCase || (Account.AppToPersonUseCase = {}));
})(Account || (Account = {}));
