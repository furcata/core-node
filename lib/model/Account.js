/**
 * Account
 */
export var Account;
(function (Account) {
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
    let Roles;
    (function (Roles) {
        Roles["agent"] = "agent";
        Roles["admin"] = "admin";
        Roles["owner"] = "owner";
        Roles["guest"] = "guest";
    })(Roles = Account.Roles || (Account.Roles = {}));
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
    let BrandType;
    (function (BrandType) {
        /// SOLE_PROPRIETOR is only available for the US, but we don't use it
        BrandType["soleProprietor"] = "SOLE_PROPRIETOR";
        BrandType["lowVolumeStandard"] = "LOW_VOLUME_STANDARD";
        BrandType["standard"] = "STANDARD";
    })(BrandType = Account.BrandType || (Account.BrandType = {}));
    // company_type accepted values: 'public','private','non-profit','government'
    let CompanyType;
    (function (CompanyType) {
        CompanyType["public"] = "public";
        CompanyType["private"] = "private";
        CompanyType["nonProfit"] = "non-profit";
        CompanyType["government"] = "government";
    })(CompanyType = Account.CompanyType || (Account.CompanyType = {}));
    // BusinessType accepted values:
    // 'Sole Proprietorship', 'Partnership', 'Limited Liability Corporation', 'Co-operative', 'Non-profit Corporation', 'Corporation'
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
    })(BusinessIndustry = Account.BusinessIndustry || (Account.BusinessIndustry = {}));
    // BusinessRegionsOfOperations accepted values:
    // 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'USA_AND_CANADA', 'AUSTRALIA'
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
