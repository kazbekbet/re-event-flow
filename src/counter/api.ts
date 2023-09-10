export function asyncCount(countTo: number, delay: number, isReject: boolean): Promise<number> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      isReject ? reject({ message: 'Error!' }) : resolve(countTo);
    }, delay);
  });
}
