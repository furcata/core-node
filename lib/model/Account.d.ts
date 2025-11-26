/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */
import { User } from '@fabricelements/shared-helpers/user';
import { BaseFirestore } from '../interface/base_db.js';
import { MessageQueue } from '../interface/queue.js';
/**
 * Account
 */
export declare namespace Account {
    enum Status {
        active = "active",
        inactive = "inactive",
        suspended = "suspended",
        paused = "paused",
        draft = "draft",
        review = "review"
    }
    enum Roles {
        agent = "agent",
        admin = "admin",
        owner = "owner",
        guest = "guest"
    }
    enum AuthorizedRepresentativeJobPosition {
        director = "Director",
        gm = "GM",
        vp = "VP",
        ceo = "CEO",
        cfo = "CFO",
        generalCounsel = "General Counsel",
        other = "Other"
    }
    interface AuthorizedRepresentative {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        businessTitle?: string;
        jobPosition?: AuthorizedRepresentativeJobPosition;
    }
    enum BrandType {
        soleProprietor = "SOLE_PROPRIETOR",
        lowVolumeStandard = "LOW_VOLUME_STANDARD",
        standard = "STANDARD"
    }
    enum CompanyType {
        public = "public",
        private = "private",
        nonProfit = "non-profit",
        government = "government"
    }
    enum BusinessType {
        soleProprietorship = "Sole Proprietorship",
        partnership = "Partnership",
        limitedLiabilityCorporation = "Limited Liability Corporation",
        coOperative = "Co-operative",
        nonProfitCorporation = "Non-profit Corporation",
        corporation = "Corporation"
    }
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
        legal = "LEGAL"
    }
    enum BusinessRegionsOfOperations {
        africa = "AFRICA",
        asia = "ASIA",
        europe = "EUROPE",
        latinAmerica = "LATIN_AMERICA",
        usaAndCanada = "USA_AND_CANADA",
        australia = "AUSTRALIA"
    }
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
     * Account
     */
    interface Interface extends BaseFirestore, MessageQueue {
        language?: string;
        image?: string;
        imageURL?: string;
        name?: string;
        businessName?: string;
        description?: string;
        status?: Status;
        uid?: string;
        links?: User.InterfaceLinks;
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
        useCaseDescription?: string;
        postalCode?: string;
        area?: string;
        city?: string;
        street1?: string;
        street2?: string;
        country?: string;
        domain?: string;
        domainOk?: boolean;
        domainTimestamp?: any;
        alias?: string;
        sampleMessage1?: string;
        sampleMessage2?: string;
        sampleMessage3?: string;
        sampleMessage4?: string;
        sampleMessage5?: string;
        bca?: string;
    }
}
