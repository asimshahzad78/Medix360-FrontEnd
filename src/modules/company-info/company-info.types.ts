// src/modules/company-info/company-info.types.ts

export interface CompanyInfoApiDto {
  Id: number
  Name: string
  ApplicationTitle: string
  Currency: string
  Address: string
  City: string
  Country: string
  Phone: string
  Email: string
  Fax: string
  Website: string
  CompanyLogoImagePath: string
}

export interface CompanyInfoSaveDto {
  Name: string
  ApplicationTitle: string
  Currency: string
  Address: string
  City: string
  Country: string
  Phone: string
  Email: string
  Fax: string
  Website: string
  CompanyLogo?: File | null
}
