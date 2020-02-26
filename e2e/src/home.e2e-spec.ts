import { HomePageObject } from './home.po';

describe('Home', () => {
    let homePage: HomePageObject;

    beforeEach(() => {
        homePage = new HomePageObject();
        homePage.navigateTo();
    });

    it("should contain data privacy", () => {
        expect(homePage.getDataPrivacySentence().getText()).toContain('No data is sent to any server, everything is analysed in your browser');
    });
});