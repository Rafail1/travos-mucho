import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, debounceTime, startWith } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { RootState } from 'src/app/store/app.reducer';
import { selectSymbol } from 'src/app/store/app.selectors';
import { setSquiz } from 'src/app/store/config/config.actions';
import { ConfigState } from 'src/app/store/config/config.reducer';
import { SettingsService } from './settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public form: FormGroup;
  public barsVolumeFormat: FormGroup;
  public barsPriceFormat: FormGroup;
  public tickVolumeFormat: FormGroup;
  public clusterVolumeFormat: FormGroup;

  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private store: Store<RootState>
  ) {
    this.form = this.fb.group({
      squiz: [],
      maxBarVolume: [],
      bigVolume: [],
      hugeVolume: [],
      maxClusterVolume: [],
    });

    this.barsPriceFormat = this.getFormatFormGroup();
    this.barsVolumeFormat = this.getFormatFormGroup();
    this.tickVolumeFormat = this.getFormatFormGroup();
    this.clusterVolumeFormat = this.getFormatFormGroup();
  }

  ngOnInit(): void {
    this.initForm();
    this.subscribeForm();
  }

  private subscribeForm() {
    this.form
      .get('squiz')
      ?.valueChanges.pipe(debounceTime(300), filterNullish())
      .subscribe((squiz) => {
        this.store.dispatch(setSquiz({ squiz }));
      });

    combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
      this.barsVolumeFormat.valueChanges.pipe(
        startWith(this.barsVolumeFormat.getRawValue())
      ),
      this.barsPriceFormat.valueChanges.pipe(
        startWith(this.barsPriceFormat.getRawValue())
      ),
      this.tickVolumeFormat.valueChanges.pipe(
        startWith(this.tickVolumeFormat.getRawValue())
      ),
      this.clusterVolumeFormat.valueChanges.pipe(
        startWith(this.clusterVolumeFormat.getRawValue())
      ),
    ])
      .pipe(debounceTime(300))
      .subscribe(
        ([
          form,
          barsVolumeFormat,
          barsPriceFormat,
          tickVolumeFormat,
          clusterVolumeFormat,
        ]) => {
          const config: ConfigState = {
            maxClusterVolume: form.maxClusterVolume,
            squiz: form.squiz,
            maxBarVolume: form.maxBarVolume,
            bigVolume: form.bigVolume,
            hugeVolume: form.hugeVolume,
            bars: {
              volumeFormat: barsVolumeFormat,
              priceFormat: barsPriceFormat,
            },
            tick: {
              volumeFormat: tickVolumeFormat,
            },
            cluster: {
              volumeFormat: clusterVolumeFormat,
            },
          };

          this.settingsService.setSettings(config);
        }
      );
  }

  private initForm() {
    this.store
      .select(selectSymbol)
      .pipe(filterNullish())
      .subscribe(() => {
        const config = this.settingsService.getSettings();
        this.form.get('squiz')?.setValue(config.squiz);
        this.form.get('maxBarVolume')?.setValue(config.maxBarVolume);
        this.form.get('bigVolume')?.setValue(config.bigVolume);
        this.form.get('hugeVolume')?.setValue(config.hugeVolume);
        this.form.get('maxClusterVolume')?.setValue(config.maxClusterVolume);

        this.clusterVolumeFormat
          .get('decPlaces')
          ?.setValue(config?.cluster.volumeFormat.decPlaces);

        this.clusterVolumeFormat
          .get('shorten')
          ?.setValue(config?.cluster.volumeFormat.shorten);

        this.tickVolumeFormat
          .get('decPlaces')
          ?.setValue(config?.tick.volumeFormat.decPlaces);

        this.tickVolumeFormat
          .get('shorten')
          ?.setValue(config?.tick.volumeFormat.shorten);

        this.barsPriceFormat
          .get('decPlaces')
          ?.setValue(config?.bars.priceFormat.decPlaces);

        this.barsPriceFormat
          .get('shorten')
          ?.setValue(config?.bars.priceFormat.shorten);

        this.barsVolumeFormat
          .get('decPlaces')
          ?.setValue(config?.bars.volumeFormat.decPlaces);

        this.barsVolumeFormat
          .get('shorten')
          ?.setValue(config?.bars.volumeFormat.shorten);
      });
  }

  private getFormatFormGroup() {
    return this.fb.group({
      decPlaces: [],
      shorten: [],
    });
  }
}
