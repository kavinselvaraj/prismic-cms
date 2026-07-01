import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

type ContentPageDocumentDataSlicesSlice = CtaBannerSlice | PageHeaderSlice | FaqQuestionListSlice | PopularRoutesSlice | LinkGroupSlice | HeroSectionSlice | RichTextSlice | RichTextSectionSlice

/**
 * Content for Content Page documents
 */
interface ContentPageDocumentData {
	/**
	 * Breadcrumb Level 1 Label field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.breadcrumb_level_1_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	breadcrumb_level_1_label: prismic.KeyTextField;
	
	/**
	 * Breadcrumb Level 1 Href field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.breadcrumb_level_1_href
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	breadcrumb_level_1_href: prismic.KeyTextField;
	
	/**
	 * Breadcrumb Level 2 Label field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.breadcrumb_level_2_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	breadcrumb_level_2_label: prismic.KeyTextField;
	
	/**
	 * Breadcrumb Level 2 Href field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.breadcrumb_level_2_href
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	breadcrumb_level_2_href: prismic.KeyTextField;
	
	/**
	 * Breadcrumb Level 3 Label field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.breadcrumb_level_3_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	breadcrumb_level_3_label: prismic.KeyTextField;
	
	/**
	 * Breadcrumb Level 3 Href field in *Content Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.breadcrumb_level_3_href
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	breadcrumb_level_3_href: prismic.KeyTextField;
	
	/**
	 * Slice Zone field in *Content Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: content_page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<ContentPageDocumentDataSlicesSlice>;
}

/**
 * Content Page document from Prismic
 *
 * - **API ID**: `content_page`
 * - **Repeatable**: `true`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type ContentPageDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<Simplify<ContentPageDocumentData>, "content_page", Lang>;

/**
 * Content for Flight Search documents
 */
interface FlightSearchDocumentData {
	/**
	 * Ptc field in *Flight Search*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search.flight_search_flight_search_ptc
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_search_flight_search_ptc: prismic.KeyTextField;/**
	 * Label field in *Flight Search*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search.flight_search_flight_search_airport_label
	 * - **Tab**: Airport
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_search_flight_search_airport_label: prismic.KeyTextField;
	
	/**
	 * Name field in *Flight Search*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_search.flight_search_flight_search_airport_name
	 * - **Tab**: Airport
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_search_flight_search_airport_name: prismic.KeyTextField;
}

/**
 * Flight Search document from Prismic
 *
 * - **API ID**: `flight_search`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FlightSearchDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<FlightSearchDocumentData>, "flight_search", Lang>;

/**
 * Content for Flight Select documents
 */
interface FlightSelectDocumentData {
	/**
	 * From Date field in *Flight Select*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_select.flight_select_flight_select_from_date
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_select_flight_select_from_date: prismic.KeyTextField;
	
	/**
	 * To Date field in *Flight Select*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: flight_select.flight_select_flight_select_to_date
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	flight_select_flight_select_to_date: prismic.KeyTextField;
}

/**
 * Flight Select document from Prismic
 *
 * - **API ID**: `flight_select`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type FlightSelectDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<FlightSelectDocumentData>, "flight_select", Lang>;

type HomePageDocumentDataSlicesSlice = HomeSlice

/**
 * Content for Home Page documents
 */
interface HomePageDocumentData {
	/**
	 * Slice Zone field in *Home Page*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<HomePageDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Home Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: home_page.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Home Page*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: home_page.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Home Page*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home_page.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Home Page document from Prismic
 *
 * - **API ID**: `home_page`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomePageDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomePageDocumentData>, "home_page", Lang>;

/**
 * Content for IBE documents
 */
interface IbeDocumentData {
	/**
	 * Flight Search field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.flight_search
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	flight_search: prismic.ContentRelationshipField<"flight_search">;
	
	/**
	 * Flight Select field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.flight_select
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	flight_select: prismic.ContentRelationshipField<"flight_select">;
	
	/**
	 * Passenger field in *IBE*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: ibe.passenger
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	passenger: prismic.ContentRelationshipField<"passenger">;
}

/**
 * IBE document from Prismic
 *
 * - **API ID**: `ibe`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type IbeDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<IbeDocumentData>, "ibe", Lang>;

/**
 * Item in *Passenger → Us Route*
 */
export interface PassengerDocumentDataPassengerPassengerTravelInfoUsRouteItem {
	/**
	 * Code field in *Passenger → Us Route*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_us_route[].code
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	code: prismic.KeyTextField;
	
	/**
	 * Name field in *Passenger → Us Route*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_us_route[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
}

/**
 * Item in *Passenger → Asia Route*
 */
export interface PassengerDocumentDataPassengerPassengerTravelInfoAsiaRouteItem {
	/**
	 * Code field in *Passenger → Asia Route*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_asia_route[].code
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	code: prismic.KeyTextField;
	
	/**
	 * Name field in *Passenger → Asia Route*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_asia_route[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
}

/**
 * Content for Passenger documents
 */
interface PassengerDocumentData {
	/**
	 * First Name field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_personal_info_first_name
	 * - **Tab**: Personal Info
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_personal_info_first_name: prismic.KeyTextField;
	
	/**
	 * Last Name field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_personal_info_last_name
	 * - **Tab**: Personal Info
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_personal_info_last_name: prismic.KeyTextField;
	
	/**
	 * Middle Name field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_personal_info_middle_name
	 * - **Tab**: Personal Info
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_personal_info_middle_name: prismic.KeyTextField;
	
	/**
	 * Date Of Birth field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_personal_info_date_of_birth
	 * - **Tab**: Personal Info
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_personal_info_date_of_birth: prismic.KeyTextField;/**
	 * Region Label field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_region_label
	 * - **Tab**: Travel Info
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_travel_info_region_label: prismic.KeyTextField;
	
	/**
	 * Us Route field in *Passenger*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_us_route[]
	 * - **Tab**: Travel Info
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	passenger_passenger_travel_info_us_route: prismic.GroupField<Simplify<PassengerDocumentDataPassengerPassengerTravelInfoUsRouteItem>>;
	
	/**
	 * Asia Route field in *Passenger*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_travel_info_asia_route[]
	 * - **Tab**: Travel Info
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	passenger_passenger_travel_info_asia_route: prismic.GroupField<Simplify<PassengerDocumentDataPassengerPassengerTravelInfoAsiaRouteItem>>;/**
	 * Passport Number field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_documents_passport_number
	 * - **Tab**: Documents
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_documents_passport_number: prismic.KeyTextField;
	
	/**
	 * Passport Expiry field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_documents_passport_expiry
	 * - **Tab**: Documents
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_documents_passport_expiry: prismic.KeyTextField;
	
	/**
	 * Nationality field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_documents_nationality
	 * - **Tab**: Documents
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_documents_nationality: prismic.KeyTextField;/**
	 * Meal Preference field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_preferences_meal_preference
	 * - **Tab**: Preferences
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_preferences_meal_preference: prismic.KeyTextField;
	
	/**
	 * Seat Preference field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_preferences_seat_preference
	 * - **Tab**: Preferences
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_preferences_seat_preference: prismic.KeyTextField;
	
	/**
	 * Special Assistance field in *Passenger*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: passenger.passenger_passenger_preferences_special_assistance
	 * - **Tab**: Preferences
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	passenger_passenger_preferences_special_assistance: prismic.KeyTextField;
}

/**
 * Passenger document from Prismic
 *
 * - **API ID**: `passenger`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type PassengerDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<PassengerDocumentData>, "passenger", Lang>;

export type AllDocumentTypes = ContentPageDocument | FlightSearchDocument | FlightSelectDocument | HomePageDocument | IbeDocument | PassengerDocument;

/**
 * Primary content in *CtaBanner → Default → Primary*
 */
export interface CtaBannerSliceDefaultPrimary {
	/**
	 * Body field in *CtaBanner → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.body
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	body: prismic.RichTextField;
	
	/**
	 * Label field in *CtaBanner → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Href field in *CtaBanner → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: cta_banner.default.primary.href
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	href: prismic.KeyTextField;
}

/**
 * Default variation for CtaBanner Slice
 *
 * - **API ID**: `default`
 * - **Description**: Call to action section for detail pages
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CtaBannerSliceDefault = prismic.SharedSliceVariation<"default", Simplify<CtaBannerSliceDefaultPrimary>, never>;

/**
 * Slice variation for *CtaBanner*
 */
type CtaBannerSliceVariation = CtaBannerSliceDefault

/**
 * CtaBanner Shared Slice
 *
 * - **API ID**: `cta_banner`
 * - **Description**: Centered CTA button block
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CtaBannerSlice = prismic.SharedSlice<"cta_banner", CtaBannerSliceVariation>;

/**
 * Primary content in *FaqQuestionList → Default → Primary*
 */
export interface FaqQuestionListSliceDefaultPrimary {
	/**
	 * Heading field in *FaqQuestionList → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq_question_list.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
	
	/**
	 * Description field in *FaqQuestionList → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq_question_list.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Primary content in *FaqQuestionList → Items*
 */
export interface FaqQuestionListSliceDefaultItem {
	/**
	 * Question field in *FaqQuestionList → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq_question_list.items[].question
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	question: prismic.KeyTextField;
	
	/**
	 * Href field in *FaqQuestionList → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: faq_question_list.items[].href
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	href: prismic.KeyTextField;
}

/**
 * Default variation for FaqQuestionList Slice
 *
 * - **API ID**: `default`
 * - **Description**: Category page list of FAQ questions
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FaqQuestionListSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FaqQuestionListSliceDefaultPrimary>, Simplify<FaqQuestionListSliceDefaultItem>>;

/**
 * Slice variation for *FaqQuestionList*
 */
type FaqQuestionListSliceVariation = FaqQuestionListSliceDefault

/**
 * FaqQuestionList Shared Slice
 *
 * - **API ID**: `faq_question_list`
 * - **Description**: Question list with links to detail pages
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FaqQuestionListSlice = prismic.SharedSlice<"faq_question_list", FaqQuestionListSliceVariation>;

/**
 * Primary content in *HeroSection → Default → Primary*
 */
export interface HeroSectionSliceDefaultPrimary {
	/**
	 * Title field in *HeroSection → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero_section.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Subtitle field in *HeroSection → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero_section.default.primary.subtitle
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	subtitle: prismic.RichTextField;
	
	/**
	 * Primary CTA field in *HeroSection → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero_section.default.primary.primary_cta
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	primary_cta: prismic.KeyTextField;
	
	/**
	 * Secondary CTA field in *HeroSection → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero_section.default.primary.secondary_cta
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	secondary_cta: prismic.KeyTextField;
}

/**
 * Default variation for HeroSection Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default hero section
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSectionSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HeroSectionSliceDefaultPrimary>, never>;

/**
 * Slice variation for *HeroSection*
 */
type HeroSectionSliceVariation = HeroSectionSliceDefault

/**
 * HeroSection Shared Slice
 *
 * - **API ID**: `hero_section`
 * - **Description**: Hero section with title, subtitle, and CTAs
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSectionSlice = prismic.SharedSlice<"hero_section", HeroSectionSliceVariation>;

/**
 * Default variation for Home Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HomeSliceDefault = prismic.SharedSliceVariation<"default", Record<string, never>, never>;

/**
 * Slice variation for *Home*
 */
type HomeSliceVariation = HomeSliceDefault

/**
 * Home Shared Slice
 *
 * - **API ID**: `home`
 * - **Description**: Home
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HomeSlice = prismic.SharedSlice<"home", HomeSliceVariation>;

/**
 * Primary content in *LinkGroup → Default → Primary*
 */
export interface LinkGroupSliceDefaultPrimary {
	/**
	 * Heading field in *LinkGroup → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: link_group.default.primary.heading
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	heading: prismic.RichTextField;
}

/**
 * Primary content in *LinkGroup → Items*
 */
export interface LinkGroupSliceDefaultItem {
	/**
	 * Label field in *LinkGroup → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: link_group.items[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Href field in *LinkGroup → Items*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: link_group.items[].href
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	href: prismic.KeyTextField;
}

/**
 * Default variation for LinkGroup Slice
 *
 * - **API ID**: `default`
 * - **Description**: Reusable group of related links
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LinkGroupSliceDefault = prismic.SharedSliceVariation<"default", Simplify<LinkGroupSliceDefaultPrimary>, Simplify<LinkGroupSliceDefaultItem>>;

/**
 * Slice variation for *LinkGroup*
 */
type LinkGroupSliceVariation = LinkGroupSliceDefault

/**
 * LinkGroup Shared Slice
 *
 * - **API ID**: `link_group`
 * - **Description**: Heading with a list of links
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type LinkGroupSlice = prismic.SharedSlice<"link_group", LinkGroupSliceVariation>;

/**
 * Primary content in *PageHeader → Default → Primary*
 */
export interface PageHeaderSliceDefaultPrimary {
	/**
	 * Eyebrow field in *PageHeader → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.eyebrow
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	eyebrow: prismic.KeyTextField;
	
	/**
	 * Title field in *PageHeader → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Description field in *PageHeader → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: page_header.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Default variation for PageHeader Slice
 *
 * - **API ID**: `default`
 * - **Description**: Top heading block for help and content pages
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PageHeaderSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PageHeaderSliceDefaultPrimary>, never>;

/**
 * Slice variation for *PageHeader*
 */
type PageHeaderSliceVariation = PageHeaderSliceDefault

/**
 * PageHeader Shared Slice
 *
 * - **API ID**: `page_header`
 * - **Description**: Page heading and intro copy
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PageHeaderSlice = prismic.SharedSlice<"page_header", PageHeaderSliceVariation>;

/**
 * Primary content in *PopularRoutes → Default → Primary*
 */
export interface PopularRoutesSliceDefaultPrimary {
	/**
	 * Title field in *PopularRoutes → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: popular_routes.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * View All field in *PopularRoutes → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: popular_routes.default.primary.view_all
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	view_all: prismic.KeyTextField;
}

/**
 * Default variation for PopularRoutes Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default popular routes section
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PopularRoutesSliceDefault = prismic.SharedSliceVariation<"default", Simplify<PopularRoutesSliceDefaultPrimary>, never>;

/**
 * Slice variation for *PopularRoutes*
 */
type PopularRoutesSliceVariation = PopularRoutesSliceDefault

/**
 * PopularRoutes Shared Slice
 *
 * - **API ID**: `popular_routes`
 * - **Description**: Popular route links and labels
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type PopularRoutesSlice = prismic.SharedSlice<"popular_routes", PopularRoutesSliceVariation>;

/**
 * Default variation for RichText Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSliceDefault = prismic.SharedSliceVariation<"default", Record<string, never>, never>;

/**
 * Slice variation for *RichText*
 */
type RichTextSliceVariation = RichTextSliceDefault

/**
 * RichText Shared Slice
 *
 * - **API ID**: `rich_text`
 * - **Description**: RichText
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSlice = prismic.SharedSlice<"rich_text", RichTextSliceVariation>;

/**
 * Primary content in *RichTextSection → Default → Primary*
 */
export interface RichTextSectionSliceDefaultPrimary {
	/**
	 * Title field in *RichTextSection → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text_section.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Description field in *RichTextSection → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: rich_text_section.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Default variation for RichTextSection Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default rich text section
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSectionSliceDefault = prismic.SharedSliceVariation<"default", Simplify<RichTextSectionSliceDefaultPrimary>, never>;

/**
 * Slice variation for *RichTextSection*
 */
type RichTextSectionSliceVariation = RichTextSectionSliceDefault

/**
 * RichTextSection Shared Slice
 *
 * - **API ID**: `rich_text_section`
 * - **Description**: Simple title and rich text content block
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type RichTextSectionSlice = prismic.SharedSlice<"rich_text_section", RichTextSectionSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			ContentPageDocument,
			ContentPageDocumentData,
			ContentPageDocumentDataSlicesSlice,
			FlightSearchDocument,
			FlightSearchDocumentData,
			FlightSelectDocument,
			FlightSelectDocumentData,
			HomePageDocument,
			HomePageDocumentData,
			HomePageDocumentDataSlicesSlice,
			IbeDocument,
			IbeDocumentData,
			PassengerDocument,
			PassengerDocumentData,
			PassengerDocumentDataPassengerPassengerTravelInfoUsRouteItem,
			PassengerDocumentDataPassengerPassengerTravelInfoAsiaRouteItem,
			AllDocumentTypes,
			CtaBannerSlice,
			CtaBannerSliceDefaultPrimary,
			CtaBannerSliceVariation,
			CtaBannerSliceDefault,
			FaqQuestionListSlice,
			FaqQuestionListSliceDefaultPrimary,
			FaqQuestionListSliceDefaultItem,
			FaqQuestionListSliceVariation,
			FaqQuestionListSliceDefault,
			HeroSectionSlice,
			HeroSectionSliceDefaultPrimary,
			HeroSectionSliceVariation,
			HeroSectionSliceDefault,
			HomeSlice,
			HomeSliceVariation,
			HomeSliceDefault,
			LinkGroupSlice,
			LinkGroupSliceDefaultPrimary,
			LinkGroupSliceDefaultItem,
			LinkGroupSliceVariation,
			LinkGroupSliceDefault,
			PageHeaderSlice,
			PageHeaderSliceDefaultPrimary,
			PageHeaderSliceVariation,
			PageHeaderSliceDefault,
			PopularRoutesSlice,
			PopularRoutesSliceDefaultPrimary,
			PopularRoutesSliceVariation,
			PopularRoutesSliceDefault,
			RichTextSlice,
			RichTextSliceVariation,
			RichTextSliceDefault,
			RichTextSectionSlice,
			RichTextSectionSliceDefaultPrimary,
			RichTextSectionSliceVariation,
			RichTextSectionSliceDefault
		}
	}
}