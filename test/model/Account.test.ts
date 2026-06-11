/**
 * @license
 * Copyright Furcata. All Rights Reserved.
 */

import { describe, it, expect } from 'vitest';
import { Account } from '../../src/model/Account.js';

describe('Account.Status', () => {
  describe('enum values', () => {
    it('should have value "active" for active', () => {
      expect(Account.Status.active).toBe('active');
    });

    it('should have value "inactive" for inactive', () => {
      expect(Account.Status.inactive).toBe('inactive');
    });

    it('should have value "suspended" for suspended', () => {
      expect(Account.Status.suspended).toBe('suspended');
    });

    it('should have value "paused" for paused', () => {
      expect(Account.Status.paused).toBe('paused');
    });

    it('should have value "draft" for draft', () => {
      expect(Account.Status.draft).toBe('draft');
    });

    it('should have value "review" for review', () => {
      expect(Account.Status.review).toBe('review');
    });

    it('should expose exactly 6 members', () => {
      const members = Object.values(Account.Status);
      expect(members).toHaveLength(6);
    });
  });
});

describe('Account.Type', () => {
  describe('enum values', () => {
    it('should have value "business" for business', () => {
      expect(Account.Type.business).toBe('business');
    });

    it('should have value "government" for government', () => {
      expect(Account.Type.government).toBe('government');
    });

    it('should have value "non_profit" for nonProfit', () => {
      expect(Account.Type.nonProfit).toBe('non_profit');
    });

    it('should expose exactly 3 members', () => {
      const members = Object.values(Account.Type);
      expect(members).toHaveLength(3);
    });
  });
});

describe('Account.Roles', () => {
  describe('enum values', () => {
    it('should have value "agent" for agent', () => {
      expect(Account.Roles.agent).toBe('agent');
    });

    it('should have value "admin" for admin', () => {
      expect(Account.Roles.admin).toBe('admin');
    });

    it('should have value "owner" for owner', () => {
      expect(Account.Roles.owner).toBe('owner');
    });

    it('should have value "guest" for guest', () => {
      expect(Account.Roles.guest).toBe('guest');
    });

    it('should expose exactly 4 members', () => {
      const members = Object.values(Account.Roles);
      expect(members).toHaveLength(4);
    });
  });
});

describe('Account.AuthorizedRepresentativeJobPosition', () => {
  describe('enum values', () => {
    it('should have value "Director" for director', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.director).toBe('Director');
    });

    it('should have value "GM" for gm', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.gm).toBe('GM');
    });

    it('should have value "VP" for vp', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.vp).toBe('VP');
    });

    it('should have value "CEO" for ceo', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.ceo).toBe('CEO');
    });

    it('should have value "CFO" for cfo', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.cfo).toBe('CFO');
    });

    it('should have value "General Counsel" for generalCounsel', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.generalCounsel).toBe('General Counsel');
    });

    it('should have value "Other" for other', () => {
      expect(Account.AuthorizedRepresentativeJobPosition.other).toBe('Other');
    });

    it('should expose exactly 7 members', () => {
      const members = Object.values(Account.AuthorizedRepresentativeJobPosition);
      expect(members).toHaveLength(7);
    });
  });
});

describe('Account.BrandType', () => {
  describe('enum values', () => {
    it('should have value "SOLE_PROPRIETOR" for soleProprietor', () => {
      expect(Account.BrandType.soleProprietor).toBe('SOLE_PROPRIETOR');
    });

    it('should have value "LOW_VOLUME_STANDARD" for lowVolumeStandard', () => {
      expect(Account.BrandType.lowVolumeStandard).toBe('LOW_VOLUME_STANDARD');
    });

    it('should have value "STANDARD" for standard', () => {
      expect(Account.BrandType.standard).toBe('STANDARD');
    });

    it('should expose exactly 3 members', () => {
      const members = Object.values(Account.BrandType);
      expect(members).toHaveLength(3);
    });
  });
});

describe('Account.CompanyType', () => {
  describe('enum values', () => {
    it('should have value "public" for public', () => {
      expect(Account.CompanyType.public).toBe('public');
    });

    it('should have value "private" for private', () => {
      expect(Account.CompanyType.private).toBe('private');
    });

    it('should have value "non-profit" for nonProfit', () => {
      expect(Account.CompanyType.nonProfit).toBe('non-profit');
    });

    it('should have value "government" for government', () => {
      expect(Account.CompanyType.government).toBe('government');
    });

    it('should expose exactly 4 members', () => {
      const members = Object.values(Account.CompanyType);
      expect(members).toHaveLength(4);
    });
  });
});

describe('Account.BusinessType', () => {
  describe('enum values', () => {
    it('should have value "Sole Proprietorship" for soleProprietorship', () => {
      expect(Account.BusinessType.soleProprietorship).toBe('Sole Proprietorship');
    });

    it('should have value "Partnership" for partnership', () => {
      expect(Account.BusinessType.partnership).toBe('Partnership');
    });

    it('should have value "Limited Liability Corporation" for limitedLiabilityCorporation', () => {
      expect(Account.BusinessType.limitedLiabilityCorporation).toBe('Limited Liability Corporation');
    });

    it('should have value "Co-operative" for coOperative', () => {
      expect(Account.BusinessType.coOperative).toBe('Co-operative');
    });

    it('should have value "Non-profit Corporation" for nonProfitCorporation', () => {
      expect(Account.BusinessType.nonProfitCorporation).toBe('Non-profit Corporation');
    });

    it('should have value "Corporation" for corporation', () => {
      expect(Account.BusinessType.corporation).toBe('Corporation');
    });

    it('should expose exactly 6 members', () => {
      const members = Object.values(Account.BusinessType);
      expect(members).toHaveLength(6);
    });
  });
});

describe('Account.BusinessIndustry', () => {
  describe('enum values', () => {
    it('should have value "AUTOMOTIVE" for automotive', () => {
      expect(Account.BusinessIndustry.automotive).toBe('AUTOMOTIVE');
    });

    it('should have value "AGRICULTURE" for agriculture', () => {
      expect(Account.BusinessIndustry.agriculture).toBe('AGRICULTURE');
    });

    it('should have value "BANKING" for banking', () => {
      expect(Account.BusinessIndustry.banking).toBe('BANKING');
    });

    it('should have value "CONSTRUCTION" for construction', () => {
      expect(Account.BusinessIndustry.construction).toBe('CONSTRUCTION');
    });

    it('should have value "CONSUMER" for consumer', () => {
      expect(Account.BusinessIndustry.consumer).toBe('CONSUMER');
    });

    it('should have value "EDUCATION" for education', () => {
      expect(Account.BusinessIndustry.education).toBe('EDUCATION');
    });

    it('should have value "ENGINEERING" for engineering', () => {
      expect(Account.BusinessIndustry.engineering).toBe('ENGINEERING');
    });

    it('should have value "ENERGY" for energy', () => {
      expect(Account.BusinessIndustry.energy).toBe('ENERGY');
    });

    it('should have value "OIL_AND_GAS" for oilAndGas', () => {
      expect(Account.BusinessIndustry.oilAndGas).toBe('OIL_AND_GAS');
    });

    it('should have value "FAST_MOVING_CONSUMER_GOODS" for fastMovingConsumerGoods', () => {
      expect(Account.BusinessIndustry.fastMovingConsumerGoods).toBe('FAST_MOVING_CONSUMER_GOODS');
    });

    it('should have value "FINANCIAL" for financial', () => {
      expect(Account.BusinessIndustry.financial).toBe('FINANCIAL');
    });

    it('should have value "FINTECH" for fintech', () => {
      expect(Account.BusinessIndustry.fintech).toBe('FINTECH');
    });

    it('should have value "FOOD_AND_BEVERAGE" for foodAndBeverage', () => {
      expect(Account.BusinessIndustry.foodAndBeverage).toBe('FOOD_AND_BEVERAGE');
    });

    it('should have value "GOVERNMENT" for government', () => {
      expect(Account.BusinessIndustry.government).toBe('GOVERNMENT');
    });

    it('should have value "HEALTHCARE" for healthcare', () => {
      expect(Account.BusinessIndustry.healthcare).toBe('HEALTHCARE');
    });

    it('should have value "HOSPITALITY" for hospitality', () => {
      expect(Account.BusinessIndustry.hospitality).toBe('HOSPITALITY');
    });

    it('should have value "INSURANCE" for insurance', () => {
      expect(Account.BusinessIndustry.insurance).toBe('INSURANCE');
    });

    it('should have value "LEGAL" for legal', () => {
      expect(Account.BusinessIndustry.legal).toBe('LEGAL');
    });

    it('should have value "MANUFACTURING" for manufacturing', () => {
      expect(Account.BusinessIndustry.manufacturing).toBe('MANUFACTURING');
    });

    it('should have value "MEDIA" for media', () => {
      expect(Account.BusinessIndustry.media).toBe('MEDIA');
    });

    it('should have value "ONLINE" for online', () => {
      expect(Account.BusinessIndustry.online).toBe('ONLINE');
    });

    it('should have value "PROFESSIONAL_SERVICES" for professionalServices', () => {
      expect(Account.BusinessIndustry.professionalServices).toBe('PROFESSIONAL_SERVICES');
    });

    it('should have value "RAW_MATERIALS" for rawMaterials', () => {
      expect(Account.BusinessIndustry.rawMaterials).toBe('RAW_MATERIALS');
    });

    it('should have value "REAL_ESTATE" for realEstate', () => {
      expect(Account.BusinessIndustry.realEstate).toBe('REAL_ESTATE');
    });

    it('should have value "RELIGION" for religion', () => {
      expect(Account.BusinessIndustry.religion).toBe('RELIGION');
    });

    it('should have value "RETAIL" for retail', () => {
      expect(Account.BusinessIndustry.retail).toBe('RETAIL');
    });

    it('should have value "JEWELRY" for jewelry', () => {
      expect(Account.BusinessIndustry.jewelry).toBe('JEWELRY');
    });

    it('should have value "TECHNOLOGY" for technology', () => {
      expect(Account.BusinessIndustry.technology).toBe('TECHNOLOGY');
    });

    it('should have value "TELECOMMUNICATIONS" for telecommunications', () => {
      expect(Account.BusinessIndustry.telecommunications).toBe('TELECOMMUNICATIONS');
    });

    it('should have value "TRANSPORTATION" for transportation', () => {
      expect(Account.BusinessIndustry.transportation).toBe('TRANSPORTATION');
    });

    it('should have value "TRAVEL" for travel', () => {
      expect(Account.BusinessIndustry.travel).toBe('TRAVEL');
    });

    it('should have value "ELECTRONICS" for electronics', () => {
      expect(Account.BusinessIndustry.electronics).toBe('ELECTRONICS');
    });

    it('should have value "NOT_FOR_PROFIT" for notForProfit', () => {
      expect(Account.BusinessIndustry.notForProfit).toBe('NOT_FOR_PROFIT');
    });

    it('should expose exactly 33 members', () => {
      const members = Object.values(Account.BusinessIndustry);
      expect(members).toHaveLength(33);
    });
  });
});

describe('Account.BusinessRegionsOfOperations', () => {
  describe('enum values', () => {
    it('should have value "AFRICA" for africa', () => {
      expect(Account.BusinessRegionsOfOperations.africa).toBe('AFRICA');
    });

    it('should have value "ASIA" for asia', () => {
      expect(Account.BusinessRegionsOfOperations.asia).toBe('ASIA');
    });

    it('should have value "EUROPE" for europe', () => {
      expect(Account.BusinessRegionsOfOperations.europe).toBe('EUROPE');
    });

    it('should have value "LATIN_AMERICA" for latinAmerica', () => {
      expect(Account.BusinessRegionsOfOperations.latinAmerica).toBe('LATIN_AMERICA');
    });

    it('should have value "USA_AND_CANADA" for usaAndCanada', () => {
      expect(Account.BusinessRegionsOfOperations.usaAndCanada).toBe('USA_AND_CANADA');
    });

    it('should have value "AUSTRALIA" for australia', () => {
      expect(Account.BusinessRegionsOfOperations.australia).toBe('AUSTRALIA');
    });

    it('should expose exactly 6 members', () => {
      const members = Object.values(Account.BusinessRegionsOfOperations);
      expect(members).toHaveLength(6);
    });
  });
});

describe('Account.BusinessRegistrationIdentifier', () => {
  describe('enum values', () => {
    it('should have value "EIN" for ein', () => {
      expect(Account.BusinessRegistrationIdentifier.ein).toBe('EIN');
    });

    it('should have value "DUNS" for duns', () => {
      expect(Account.BusinessRegistrationIdentifier.duns).toBe('DUNS');
    });

    it('should have value "CCN" for ccn', () => {
      expect(Account.BusinessRegistrationIdentifier.ccn).toBe('CCN');
    });

    it('should have value "CBN" for cbn', () => {
      expect(Account.BusinessRegistrationIdentifier.cbn).toBe('CBN');
    });

    it('should have value "CN" for cn', () => {
      expect(Account.BusinessRegistrationIdentifier.cn).toBe('CN');
    });

    it('should have value "ACN" for acn', () => {
      expect(Account.BusinessRegistrationIdentifier.acn).toBe('ACN');
    });

    it('should have value "CIN" for cin', () => {
      expect(Account.BusinessRegistrationIdentifier.cin).toBe('CIN');
    });

    it('should have value "VAT" for vat', () => {
      expect(Account.BusinessRegistrationIdentifier.vat).toBe('VAT');
    });

    it('should have value "VATRN" for vatrn', () => {
      expect(Account.BusinessRegistrationIdentifier.vatrn).toBe('VATRN');
    });

    it('should have value "RN" for rn', () => {
      expect(Account.BusinessRegistrationIdentifier.rn).toBe('RN');
    });

    it('should have value "OTHER" for other', () => {
      expect(Account.BusinessRegistrationIdentifier.other).toBe('OTHER');
    });

    it('should expose exactly 11 members', () => {
      const members = Object.values(Account.BusinessRegistrationIdentifier);
      expect(members).toHaveLength(11);
    });
  });
});

describe('Account.StockExchange', () => {
  describe('enum values', () => {
    it('should have value "NONE" for none', () => {
      expect(Account.StockExchange.none).toBe('NONE');
    });

    it('should have value "NASDAQ" for nasdaq', () => {
      expect(Account.StockExchange.nasdaq).toBe('NASDAQ');
    });

    it('should have value "NYSE" for nyse', () => {
      expect(Account.StockExchange.nyse).toBe('NYSE');
    });

    it('should have value "AMEX" for amex', () => {
      expect(Account.StockExchange.amex).toBe('AMEX');
    });

    it('should have value "AMX" for amx', () => {
      expect(Account.StockExchange.amx).toBe('AMX');
    });

    it('should have value "ASX" for asx', () => {
      expect(Account.StockExchange.asx).toBe('ASX');
    });

    it('should have value "B3" for b3', () => {
      expect(Account.StockExchange.b3).toBe('B3');
    });

    it('should have value "BME" for bme', () => {
      expect(Account.StockExchange.bme).toBe('BME');
    });

    it('should have value "BSE" for bse', () => {
      expect(Account.StockExchange.bse).toBe('BSE');
    });

    it('should have value "FRA" for fra', () => {
      expect(Account.StockExchange.fra).toBe('FRA');
    });

    it('should have value "ICEX" for icex', () => {
      expect(Account.StockExchange.icex).toBe('ICEX');
    });

    it('should have value "JPX" for jpx', () => {
      expect(Account.StockExchange.jpx).toBe('JPX');
    });

    it('should have value "JSE" for jse', () => {
      expect(Account.StockExchange.jse).toBe('JSE');
    });

    it('should have value "KRX" for krx', () => {
      expect(Account.StockExchange.krx).toBe('KRX');
    });

    it('should have value "LON" for lon', () => {
      expect(Account.StockExchange.lon).toBe('LON');
    });

    it('should have value "NSE" for nse', () => {
      expect(Account.StockExchange.nse).toBe('NSE');
    });

    it('should have value "OMX" for omx', () => {
      expect(Account.StockExchange.omx).toBe('OMX');
    });

    it('should have value "SEHK" for sehk', () => {
      expect(Account.StockExchange.sehk).toBe('SEHK');
    });

    it('should have value "SGX" for sgx', () => {
      expect(Account.StockExchange.sgx).toBe('SGX');
    });

    it('should have value "SSE" for sse', () => {
      expect(Account.StockExchange.sse).toBe('SSE');
    });

    it('should have value "STO" for sto', () => {
      expect(Account.StockExchange.sto).toBe('STO');
    });

    it('should have value "SWX" for swx', () => {
      expect(Account.StockExchange.swx).toBe('SWX');
    });

    it('should have value "SZSE" for szse', () => {
      expect(Account.StockExchange.szse).toBe('SZSE');
    });

    it('should have value "TSX" for tsx', () => {
      expect(Account.StockExchange.tsx).toBe('TSX');
    });

    it('should have value "TWSE" for twse', () => {
      expect(Account.StockExchange.twse).toBe('TWSE');
    });

    it('should have value "VSE" for vse', () => {
      expect(Account.StockExchange.vse).toBe('VSE');
    });

    it('should have value "OTHER" for other', () => {
      expect(Account.StockExchange.other).toBe('OTHER');
    });

    it('should expose exactly 27 members', () => {
      const members = Object.values(Account.StockExchange);
      expect(members).toHaveLength(27);
    });
  });
});

describe('Account.AppToPersonUseCase', () => {
  describe('enum values', () => {
    it('should have value "2FA" for twoFactorAuthentication', () => {
      expect(Account.AppToPersonUseCase.twoFactorAuthentication).toBe('2FA');
    });

    it('should have value "ACCOUNT_NOTIFICATION" for accountNotification', () => {
      expect(Account.AppToPersonUseCase.accountNotification).toBe('ACCOUNT_NOTIFICATION');
    });

    it('should have value "AGENTS_FRANCHISES" for agentsFranchises', () => {
      expect(Account.AppToPersonUseCase.agentsFranchises).toBe('AGENTS_FRANCHISES');
    });

    it('should have value "CHARITY" for charity', () => {
      expect(Account.AppToPersonUseCase.charity).toBe('CHARITY');
    });

    it('should have value "PROXY" for proxy', () => {
      expect(Account.AppToPersonUseCase.proxy).toBe('PROXY');
    });

    it('should have value "CUSTOMER_CARE" for customerCare', () => {
      expect(Account.AppToPersonUseCase.customerCare).toBe('CUSTOMER_CARE');
    });

    it('should have value "DELIVERY_NOTIFICATION" for deliveryNotification', () => {
      expect(Account.AppToPersonUseCase.deliveryNotification).toBe('DELIVERY_NOTIFICATION');
    });

    it('should have value "EMERGENCY" for emergency', () => {
      expect(Account.AppToPersonUseCase.emergency).toBe('EMERGENCY');
    });

    it('should have value "FRAUD_ALERT" for fraudAlert', () => {
      expect(Account.AppToPersonUseCase.fraudAlert).toBe('FRAUD_ALERT');
    });

    it('should have value "HIGHER_EDUCATION" for higherEducation', () => {
      expect(Account.AppToPersonUseCase.higherEducation).toBe('HIGHER_EDUCATION');
    });

    it('should have value "K12_EDUCATION" for k12Education', () => {
      expect(Account.AppToPersonUseCase.k12Education).toBe('K12_EDUCATION');
    });

    it('should have value "LOW_VOLUME" for lowVolume', () => {
      expect(Account.AppToPersonUseCase.lowVolume).toBe('LOW_VOLUME');
    });

    it('should have value "MARKETING" for marketing', () => {
      expect(Account.AppToPersonUseCase.marketing).toBe('MARKETING');
    });

    it('should have value "MIXED" for mixed', () => {
      expect(Account.AppToPersonUseCase.mixed).toBe('MIXED');
    });

    it('should have value "POLITICAL" for political', () => {
      expect(Account.AppToPersonUseCase.political).toBe('POLITICAL');
    });

    it('should have value "PUBLIC_SERVICE_ANNOUNCEMENT" for publicServiceAnnouncement', () => {
      expect(Account.AppToPersonUseCase.publicServiceAnnouncement).toBe('PUBLIC_SERVICE_ANNOUNCEMENT');
    });

    it('should have value "SECURITY_ALERT" for securityAlert', () => {
      expect(Account.AppToPersonUseCase.securityAlert).toBe('SECURITY_ALERT');
    });

    it('should have value "SOCIAL" for social', () => {
      expect(Account.AppToPersonUseCase.social).toBe('SOCIAL');
    });

    it('should have value "SWEEPSTAKE" for sweepstake', () => {
      expect(Account.AppToPersonUseCase.sweepstake).toBe('SWEEPSTAKE');
    });

    it('should expose exactly 19 members', () => {
      const members = Object.values(Account.AppToPersonUseCase);
      expect(members).toHaveLength(19);
    });
  });
});

describe('Account.AuthorizedRepresentative', () => {
  describe('interface shape', () => {
    it('should accept an empty object', () => {
      const rep: Account.AuthorizedRepresentative = {};
      expect(rep).toBeDefined();
    });

    it('should accept all identity fields', () => {
      const rep: Account.AuthorizedRepresentative = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '+15555550100',
        businessTitle: 'Chief Executive Officer',
        jobPosition: Account.AuthorizedRepresentativeJobPosition.ceo,
      };
      expect(rep.firstName).toBe('Jane');
      expect(rep.lastName).toBe('Doe');
      expect(rep.email).toBe('jane.doe@example.com');
      expect(rep.phoneNumber).toBe('+15555550100');
      expect(rep.businessTitle).toBe('Chief Executive Officer');
      expect(rep.jobPosition).toBe('CEO');
    });
  });
});

describe('Account.Interface', () => {
  describe('empty document', () => {
    it('should accept an empty object', () => {
      const account: Account.Interface = {};
      expect(account).toBeDefined();
    });
  });

  describe('identity and display fields', () => {
    it('should accept name and businessName', () => {
      const account: Account.Interface = {
        name: 'Mayor John',
        businessName: 'City of Springfield',
        useName: 'City of Springfield (Mayor John)',
      };
      expect(account.name).toBe('Mayor John');
      expect(account.businessName).toBe('City of Springfield');
    });

    it('should accept status from Account.Status', () => {
      const account: Account.Interface = { status: Account.Status.active };
      expect(account.status).toBe('active');
    });

    it('should accept type from Account.Type', () => {
      const account: Account.Interface = { type: Account.Type.government };
      expect(account.type).toBe('government');
    });

    it('should accept uid as a string', () => {
      const account: Account.Interface = { uid: 'firebase-auth-uid-abc' };
      expect(account.uid).toBe('firebase-auth-uid-abc');
    });

    it('should accept language as a BCP-47 tag', () => {
      const account: Account.Interface = { language: 'en' };
      expect(account.language).toBe('en');
    });

    it('should accept description', () => {
      const account: Account.Interface = { description: 'Serves the residents of Springfield.' };
      expect(account.description).toBe('Serves the residents of Springfield.');
    });
  });

  describe('address fields', () => {
    it('should accept all address sub-fields', () => {
      const account: Account.Interface = {
        street1: '742 Evergreen Terrace',
        street2: 'Suite 1',
        city: 'Springfield',
        area: 'IL',
        postalCode: '62701',
        country: 'US',
      };
      expect(account.street1).toBe('742 Evergreen Terrace');
      expect(account.city).toBe('Springfield');
      expect(account.country).toBe('US');
    });
  });

  describe('domain fields', () => {
    it('should accept domain and domainOk', () => {
      const account: Account.Interface = { domain: 'springfield.gov', domainOk: true };
      expect(account.domain).toBe('springfield.gov');
      expect(account.domainOk).toBe(true);
    });

    it('should accept alias', () => {
      const account: Account.Interface = { alias: 'springfield' };
      expect(account.alias).toBe('springfield');
    });
  });

  describe('Twilio registration fields', () => {
    it('should accept companyType', () => {
      const account: Account.Interface = { companyType: Account.CompanyType.government };
      expect(account.companyType).toBe('government');
    });

    it('should accept stockExchange as NONE for private entities', () => {
      const account: Account.Interface = { stockExchange: Account.StockExchange.none };
      expect(account.stockExchange).toBe('NONE');
    });

    it('should accept businessType', () => {
      const account: Account.Interface = { businessType: Account.BusinessType.corporation };
      expect(account.businessType).toBe('Corporation');
    });

    it('should accept businessIndustry', () => {
      const account: Account.Interface = { businessIndustry: Account.BusinessIndustry.government };
      expect(account.businessIndustry).toBe('GOVERNMENT');
    });

    it('should accept businessRegionsOfOperations', () => {
      const account: Account.Interface = {
        businessRegionsOfOperations: Account.BusinessRegionsOfOperations.usaAndCanada,
      };
      expect(account.businessRegionsOfOperations).toBe('USA_AND_CANADA');
    });

    it('should accept businessRegistrationIdentifier', () => {
      const account: Account.Interface = {
        businessRegistrationIdentifier: Account.BusinessRegistrationIdentifier.ein,
      };
      expect(account.businessRegistrationIdentifier).toBe('EIN');
    });

    it('should accept businessRegistrationNumber', () => {
      const account: Account.Interface = { businessRegistrationNumber: '12-3456789' };
      expect(account.businessRegistrationNumber).toBe('12-3456789');
    });

    it('should accept brandType derived from estimatedVolume', () => {
      const account: Account.Interface = {
        estimatedVolume: 10000,
        brandType: Account.BrandType.standard,
      };
      expect(account.brandType).toBe('STANDARD');
    });

    it('should accept appToPersonUseCase', () => {
      const account: Account.Interface = {
        appToPersonUseCase: Account.AppToPersonUseCase.marketing,
      };
      expect(account.appToPersonUseCase).toBe('MARKETING');
    });

    it('should accept up to two authorizedRepresentatives', () => {
      const rep: Account.AuthorizedRepresentative = {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        jobPosition: Account.AuthorizedRepresentativeJobPosition.ceo,
      };
      const account: Account.Interface = {
        authorizedRepresentative1: rep,
        authorizedRepresentative2: { firstName: 'Bob', jobPosition: Account.AuthorizedRepresentativeJobPosition.vp },
      };
      expect(account.authorizedRepresentative1?.firstName).toBe('Alice');
      expect(account.authorizedRepresentative2?.firstName).toBe('Bob');
    });
  });

  describe('messaging compliance fields', () => {
    it('should accept up to 5 sample messages', () => {
      const account: Account.Interface = {
        sampleMessage1: 'Hello [FirstName], this is a test message from Example Corp.',
        sampleMessage2: 'Your appointment is confirmed for [Date].',
        sampleMessage3: 'Reply STOP to opt out.',
        sampleMessage4: 'Sale ends Sunday! Use code SAVE20.',
        sampleMessage5: 'Your order #1234 has shipped.',
      };
      expect(account.sampleMessage1).toContain('Hello');
      expect(account.sampleMessage5).toContain('shipped');
    });

    it('should accept automaticHeader flag', () => {
      const account: Account.Interface = { automaticHeader: true };
      expect(account.automaticHeader).toBe(true);
    });

    it('should accept toll-free and use-case description fields', () => {
      const account: Account.Interface = {
        tollFreeUseCase: 'Customer notifications',
        useCaseDescription: 'We send appointment reminders and service updates.',
        useCaseDescriptionCTA: 'Text us to confirm your appointment.',
      };
      expect(account.tollFreeUseCase).toBe('Customer notifications');
    });
  });

  describe('billing field', () => {
    it('should accept a Stripe Connected Account ID', () => {
      const account: Account.Interface = { bca: 'acct_1234567890' };
      expect(account.bca).toBe('acct_1234567890');
    });
  });

  describe('MessageQueue fields inherited via Interface', () => {
    it('should accept queue counter fields', () => {
      const account: Account.Interface = { pending: 10, ready: 5, sending: 2 };
      expect(account.pending).toBe(10);
      expect(account.ready).toBe(5);
      expect(account.sending).toBe(2);
    });
  });

  describe('BaseFirestore fields inherited via Interface', () => {
    it('should accept id and backup fields', () => {
      const account: Account.Interface = { id: 'acct-001', backup: true };
      expect(account.id).toBe('acct-001');
      expect(account.backup).toBe(true);
    });
  });
});
