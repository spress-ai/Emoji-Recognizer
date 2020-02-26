import { browser, by, element, ElementFinder } from 'protractor';

export class HomePageObject {
    navigateTo(){
        return browser.get('/');
    }

    getDataPrivacySentence(){
        return element(by.css('.dataPrivacy'));
    }
}