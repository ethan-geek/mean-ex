import { AbstractControl } from '@angular/forms';
import { Observable, Observer } from 'rxjs';

// Promise<{[key: string]}> 대괄호는 배열을 의미하지 않고 동적 프로퍼티 이름이라는 것을 의미
export const mimeType = (
  control: AbstractControl
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {
  const file = control.value as File;
  const fileReader = new FileReader();
  // 옵저버는 간단히 옵저버블이 데이터를 내보내는 시점을 제어하는 도구
  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    // loaded와 load의 차이점은 loaded가 파일에 대한 정보를 더 많이 갖고 있다
    fileReader.addEventListener('loadend', () => {
      /**
       * 정수 내부에 8비트의 새로운 배열을 생성
       * 파일에서 특정한 패턴에 액세스하거나 읽게 해주는 방식이며 파일 뿐만 아니라 MIME 타입을 파싱하는데
       * 사용하는 파일 메타데이터에서도 가능, 변할 수 있는 파일 확장자만 확인하고 싶지는 않기 때문이며
       * 대신 파일을 조사하고 파일 타입을 유추하고 싶기 때문에 Uint8Array 를 사용
       * Uint8Array로 쉽게 변환할 수 있기 떄문에 배열 버퍼로 읽는 이유이며 간단히 파일 리더 결과를 전달하면 변환됩니다.
       */
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(
        0,
        4
      );
      let header = '';
      let isValid = false;

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      switch (header) {
        case '89504e47':
          isValid = true;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }

      if (!!isValid) {
        observer.next(null);
      } else {
        observer.next({ invalidMimeType: true });
      }
      observer.complete();
    });
    // MIME 타입 액세스를 위해
    fileReader.readAsArrayBuffer(file);
  });

  return frObs;
};
