import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, Platform } from '@ionic/angular';

import { HomePage } from './home.page';
import { WebcamModule } from 'ngx-webcam';
import { DebugElement } from '@angular/core';
import {By} from '@angular/platform-browser';
import { PlatformMock } from 'mocks/platform-mock';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let el: DebugElement;
  let platform;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomePage ],
      imports: [IonicModule.forRoot(), WebcamModule],
      providers: [
        Platform
        //{ provide: Platform, useClass: PlatformMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    fixture.detectChanges();
    platform = fixture.debugElement.injector.get(Platform)
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a class member called showCamera', () => {
    expect(component.showCamera).toBe(true);
  });

  it('should have a class member called emojis with length of 7', () => {
    expect(component.emojis).toBeTruthy();
    expect(component.emojis.length).toEqual(7);
  });

  it('should display error message if camera is not found and platform is Android', () => {
    platform.is = jasmine.createSpy("is").and.returnValue("android");
    component.cameraInitError({ mediaStreamError: { name: "NotFoundError" } });
    fixture.detectChanges();

    let errorContainer = el.query(By.css(".cameraErrorMessage"));
    expect(errorContainer.nativeElement.textContent).toContain("Browser not supported. On Android, please use Google Chrome.");
  });

  it('should display error message if camera NotAllowedError and platform is Android', () => {
    platform.is = jasmine.createSpy("is").and.returnValue("android");
    component.cameraInitError({ mediaStreamError: { name: "NotAllowedError" } });
    fixture.detectChanges();

    let errorContainer = el.query(By.css(".cameraErrorMessage"));
    expect(errorContainer.nativeElement.textContent).toContain("Make sure you have accepted the permissions to use the camera.");
  });

  it('should display error message if camera error and platform is iOS', () => {
    platform.is = jasmine.createSpy("is").and.returnValue("ios");
    component.getBrowserName = jasmine.createSpy("getBrowserName").and.returnValue("chrome");
    component.cameraInitError({ mediaStreamError: { name: "NotFoundError" } });
    fixture.detectChanges();

    let errorContainer = el.query(By.css(".cameraErrorMessage"));
    expect(errorContainer.nativeElement.textContent).toContain("Browser not supported. On iOS, please use Safari.");
  });

  it('should display error message if camera error and platform is not iOS and not Android', () => {
    platform.is = jasmine.createSpy("is").and.returnValue("browser");
    component.cameraInitError({ mediaStreamError: { name: "NotFoundError" } });
    fixture.detectChanges();

    let errorContainer = el.query(By.css(".cameraErrorMessage"));
    expect(errorContainer.nativeElement.textContent).toContain("Please make sure that your device has a camera and that the latter is activated.");
  });

  it('should display error message if camera NotAllowedError and platform is not iOS and not Android', () => {
    platform.is = jasmine.createSpy("is").and.returnValue("browser");
    component.cameraInitError({ mediaStreamError: { name: "NotAllowedError" } });
    fixture.detectChanges();

    let errorContainer = el.query(By.css(".cameraErrorMessage"));
    expect(errorContainer.nativeElement.textContent).toContain("In addition, make sure that you have accepted the permissions for using the camera.");
  });
});
