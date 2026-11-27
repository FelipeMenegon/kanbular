import { Component, inject } from '@angular/core';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastContainer {
  toastService = inject(ToastService);

  readonly icons = {
    success: 'check_circle',
    error: 'error',
  };
}
