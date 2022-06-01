/**
 * _LC = lowercase
 * _V = verb
 */

/*
import {configuration} from "./configuration";
import Cookies from "js-cookie";
*/

const versions = [
    {
        id: "nb",
        isDefault: true,
        value: {
            could_not_reach_server: "Kunne ikkje kontakte serveren",
            an_unknown_error_occured: "Ein uventa feil oppstod",
            an_error_occured: "Ein feil oppstod",
            try_again_soon: "Prøv igjen snart",
            new_password_is_applied: "Nytt passord er sett",
            are_you_sure: "Er du sikker?",
            are_you_sure_you_want_to_delete: "Er du sikker på at du vil slette",
            is_deleted_LC: "er sletta",
            has_invalid_file_format_LC: "har ugyldig filformat",
            delete: "Slett",
            cancel: "Kanseller",
            view: "Inspiser",
            edit: "Rediger",
            invalid_form: "Ugyldig skjema",
            the_product_is_updated: "Produktet er oppdatert",
            the_product_is_added: "Produktet er lagt til",
            could_not: "Kunne ikkje",
            could_not_update_the_product: "Kunne ikkje oppdatere produktet",
            could_not_add_the_product: "Kunne ikkje legge til produktet",
            could_not_add_the_category: "Kunne ikkje legge til kategorien",
            could_not_retrieve_products: "Kunne ikkje hente produktene",
            could_not_retrieve_orders: "Kunne ikkje hente bestillingene",
            could_not_retrieve_categories: "Kunne ikkje hente kategoriene",
            could_not_delete_product: "Kunne ikkje slette produktet",
            could_not_delete_category: "Kunne ikkje slette kategorien",
            could_not_upload: "Kunne ikkje laste opp",
            too_many_files: "For mange filer",
            max_five_files_at_a_time: "Maks 5 filer om gangen",
            invalid_file: "Ugyldig fil",
            is_too_big_LC: "er for stor",
            too_big_file: "For stor fil",
            the_image: "Bildet",
            the_images: "Bildene",
            is_uploaded_LC: "er lasta opp",
            picture_of_the_product: "Bilde av produktet",
            save: "Lagre",
            new_product: "Nytt produkt",
            create: "Opprett",
            hide_V: "Gjemme",
            show_V: "Vise",
            show: "Vis",
            hide: "Gjem",
            are_you_sure_you_want_to: "Er du sikker på at du vil",
            in_the_store: "I butikken",
            is_required_LC: "er påkrevd",
            is_invalid_LC: "er ugyldig",
            name: "Namn",
            the_email_address: "E-postadressen",
            the_password: "Passordet",
            could_not_validate_your_order: "Kunne ikkje validere din ordre",
            the_shopping_bag_is_empty: "Handlekorgen er tom",
            to_add_LC: "for å legge til",
            go_to: "Gå til",
            go_to_LC: "gå til",
            click_on: "Trykk på",
            search: "Søk",
            next_page: "Neste side",
            previous_page: "Forrige side",
        },
    },
];

/*function getIsoCodeFromCultureCookie(v) {
    if (v === undefined) return "";
    return v.slice(v.lastIndexOf('=') + 1)
}
// uses js-cookie
const prefferedLanguage = getIsoCodeFromCultureCookie(Cookies.get(configuration.cookies.culture));
const indexOfPrefferedLanguage = versions.findIndex(version => version.id === prefferedLanguage);
const indexOfDefaultLanguage = versions.findIndex(version => version.isDefault === true);
export const strings = {
    languageSpesific: indexOfPrefferedLanguage !== -1
        ? versions[indexOfPrefferedLanguage].value
        : versions[indexOfDefaultLanguage].value,
};
 */

export const strings = {
    languageSpesific: versions[0].value
}