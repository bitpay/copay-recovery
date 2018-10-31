import { TestBed, inject } from '@angular/core/testing';

import { RecoveryService } from './recovery.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import * as _ from 'lodash';

describe('RecoveryService', () => {

  let recoveryService: RecoveryService;

  const testMnemonicsInputs = [{
    // mnemonics - 1-1 - btc - livenet
    inputs: [{ backup: 'mom mom mom mom mom mom mom mom mom mom mom mom' }],
    signaturesNumber: 1,
    copayersNumber: 1,
    coin: 'btc',
    network: 'livenet'
  }, {
    // mnemonics - 1-1 - btc - testnet
    inputs: [{ backup: 'mom mom mom mom mom mom mom mom mom mom mom mom' }],
    signaturesNumber: 1,
    copayersNumber: 1,
    coin: 'btc',
    network: 'testnet'
  }, {
    // mnemonics - 1-1 - bch - livenet
    inputs: [{ backup: 'mom mom mom mom mom mom mom mom mom mom mom mom' }],
    signaturesNumber: 1,
    copayersNumber: 1,
    coin: 'bch',
    network: 'livenet'
  }, {
    // mnemonics - 1-1 - bch - testnet
    inputs: [{ backup: 'mom mom mom mom mom mom mom mom mom mom mom mom' }],
    signaturesNumber: 1,
    copayersNumber: 1,
    coin: 'bch',
    network: 'testnet'
  }, {
    // mnemonics - 1-2 - btc - livenet
    inputs: [
      { backup: 'salsa almíbar roer malo anillo deseo ruptura manco ancla chancla mes sangre' },
      { backup: 'rociar tormenta lesión dama motivo refrán óptica guiño milagro dental obispo captar' }
    ],
    signaturesNumber: 1,
    copayersNumber: 2,
    coin: 'btc',
    network: 'livenet'
  }, {
    // mnemonics - 1-2 - btc - livenet - only one mnemonic
    inputs: [
      { backup: 'salsa almíbar roer malo anillo deseo ruptura manco ancla chancla mes sangre' },
      { backup: null }
    ],
    signaturesNumber: 1,
    copayersNumber: 2,
    coin: 'btc',
    network: 'livenet'
  }, {
    // mnemonics - 1-2 - bch - livenet
    inputs: [
      { backup: 'sagaz entrar silla corona punto bache reacción lazo experto elegir gesto ingenio' },
      { backup: 'cromo surco abono viral liga mitad naipe miedo corcho contar núcleo rebaño' }
    ],
    signaturesNumber: 1,
    copayersNumber: 2,
    coin: 'bch',
    network: 'livenet'
  }];

const testFileInputs = [{
  // file - 1-1 - btc - livenet
  inputs: [
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"j9exgLZQ+1kuxitBzHbTGQ==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"XEgMRLY3Tj7qtOj0NXZEjmlQxHLuNusfQ3KjgQChcOh2+O3mlyKqfLbRFsbvduZKADiTGSZ7HFb9TZeEnXqDLvW96C05FdXF5kVJTbbaL5QKRvXBBG5u7yFUp+r3ChIY29MQNtUn/HijW4WampkCgnm28GB9mCN5lLZL59eHXZ8goT13h1xtM7fvtOoGK7NuVGU8XbE2E1wak6MQvum+uV6oxwNGCmiwdBy8koCla1xvB9O0fiEZFAnWTl3ubgczsdcSo/1nuivXolraVIsDNld/NecGMYaEI0kAiiu2B2yRN0KkrzYXXooU5xJTXQ+gAMuat3S0KtLFR1Rwd7rDGwUMNRPMMFHY6PfOz/T8EiXAJbqRJi7bPjEVDiG5L2l0bnq2pYMIs3OlkPd1sF+HeSCeMihWGmw9MyRwKR5JQb03ksFXTeICVGl2BJ8tHdV/TTK7lho4L5f3lMnkNjCd1VQPhmF63NIIK9hclMFo3V501co++vesUj4itti4/dfS/acl8rJIycRrBQ0aorU9xWvNgSrQNVVAWN4pxVbtIRSAuDuErxcNUUsGCn8fOsGGYiYWEMPE8c8fItUDZg6WAJ9hy9SqliHXVevYKVZbPh6Vks+5ZJsyp3OBgHA725QceHoyJvBXwvQP0cONN9yyFDziYMLLB3xDd8Zizu/kXT58Yh5/U3VjgbvRsMQixJgKNZL4YjBgHwwbMJ+LtFMSEUCINJeVNR08tcx9D+wTBCswfWO3hCzebkcVwM34QhPrlgMoq1BNQJSRVIaXsNV0S5Gmj/paQ5p0a1cCKEb8k4poj8m+pyAPBlPqzN2Yruymix3hx8ukvZdhALDUh0qZbMbtu4g+7FHANWCmy7zxWAk6C0q24raXj3w/Farg7FBe8UrdrzaZNqWk8FUE4PVZS3Rt8o5a4zrOsmu2SoIQ5mERlKJwvqJjkE2B7ndaFIZ+To8WFhopdPdkp11sFMz70t1EwNW+7qyXhLD7/BwyezsGanUxJdkuBL9Zp1uXiP+kO0uC8ogBFO2H/3Be+DSWi02Oa6Zerk9+pAGBz9wltISfn7uuJZNznQN/7SSGU/2Mtbva0/uleKF8ir4JC0gccbbzvrHwrR7uW0k5slyIvEv32kZfNMRvj1xaEMiZXWkehFGT1kJV9BOg5ri/k5exXj9ZspusRSAB09S2+CX0NXgXhMe/Vas8PRZoVV/uPQKLJYqZFTCwtU+fYZX3p1imto6bCyVWaMf7pw9Z5MvSgdCIxwO1sB4PVDQxWsHNX3SxbY3GP5k0NCLmnxje6fYioZFf8mCcIbcB3oW5WiS22kZUyHy9yKiVpSNsgLuM/RSthHYOUORHxw6fMWPNUuX8cm8qnC6MhAoIUOJaRiPneCkvnPD19f7ESOhrx+mharwekIRnUZHK4SFIVzTRZeY55zJLNCgqQEF0BTYGz4mufLah8Rf4GnLHml8pmOB4eY4QyixC+t5o/GBO0GR2t2Y2s/JAa7xOufapeeQrRKZ0zMz9QmpFKQYxtfYmpZbwtzahjW5eVjuvfnNVYUFf9LY1J42PjewFLcf+e0l+fDN75LXFEH9CXtVCfOnalo9xEJ6595oEjj8w393SzdBOx1bNL6l5RQiPo2BDCklwFSGS472XaHm9pgKkkxmD/UrKP5AyDAVNv48hlkXmugy9AEQvHyU5AsvfmTqZ+24n6Y4MTgPo9ZOv7eqz1oCFC6tvNazG9xauIx0LTly71Q/WC38+iKluqla+FzUz6B3RzakK6gOimuLrkLFBoM/i6/9hmaWW8de/WnpuVDkv4q+Ud1pZLhSssAl7Zg3uohWopQs="}',
      password: '1'
    }
  ],
  signaturesNumber: 1,
  copayersNumber: 1,
  coin: 'btc',
  network: 'livenet'
}, {
  // file - 1-1 - btc - testnet
  inputs: [
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"oJjp16OJ8M4RBXU0itpLtw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"j5+2g+lzZhE=","ct":"Ika4Q+q3XcQowU3TYTlc9RK+6JaXhEk0gevTHqhohd7TUiJwEiPKTDgXHJ+xD857ZSZqYG516g+IHO3o1ST/chXN8fP9Gt4wlZ7DVBDR1wc6lLpkl+nULAKXSoNEw3QyLRn7RZIhGDrZ/Jj3wH9Wjjx5zbswV8aX6nJ1sfxMtI6VXxVjp1CpuHoCR4w5KCMOY4Xr0zhbcWOPpgF4FdjzGrdVbTsiTO/LTCl4PX/h9TIOYe20xGtNpKBThWAffxmAkCc5NwlA4A3Aw1NmhAvQNxEc2Sxzv/HkNT0YUMmpY+VEtyjFXvSJQqwe2g8bOWNs7/7Wk+WJFmLftI/zZdSyb5eEUHKaKd/j+kUZGuGw2E2W3EGn6MUpqaxn2GHzB/QLXxwkKhhqsaBj+JaRfGlGaOge2kZW0nsu0/sCLiiDQe6UT68LRSh5ULBIt0ubaXZUEFa1GeVOxw8HalEyHp8cJSLT+u7QSyW40wTuct7UV82aAzIuKV4hymlGDmV4znI8ODOAFvk5dzZQWmcp0//MzV5Z3UyEe/cZWzMOBCFT2Caxjz+F9eY9Q1DSsJQT5aNvOf3SPL3TO0OcKE6VLKRGkHI+DIU7/XqA/lq5xlXbDcogfu9PSQamHLmihlKsFGn8FMg1Mwth8tuNkkHo+WER25Pz2P1H3HW+eUUr8HRRXX7SXRJxx1k7uEZYmY5eX3GB1KZGDBI9WB1uI3yxokDir9l/z7NfXUQfy2ga43F6ABBhRydQ+q8GgcNdVY1xDxgGb7nZvLqEcoc9DjnV4Q44tKMStbFyMKJ5APzXckFPMOR4UKYfm+Ajg2Yt/ecytQmUdvBO+HuiV08cbSgS2eYYnQd8+NK536neOOyS9ZP1DD6Q4jUyro4PUau9whDAkcg7GxITvfdohez1F8GlabGOlloH6jYf5MgH46E2KJ94zI9D2T3XLZPljnGoWa9FBH+0gXgQeaNKJ7y7KyBvBFCVEr0zjXgtBE/YvcBEB2NXmGsz/qu35cNDZcEZ+86nb6FvAuRbaHxYsYD/uarTXD/0muWgIxftwyAx8M8BjzBJqbVjOZsZl83LFXBnW1UHlevWNx4KcwkkZOpPtTQTjY8/4UvsTEvI9584T+V/Ru4qLcn49aL0ohUdiYV/domgGiFAlWDIX9TE0kfMtgir3SDNNNW/l8oX0R0xJw7uOBODQVMeJWr2ljLw0314Txhr+0Y8a6E1Jh3mY6a2ryYGvyKqlGovgFj7sJaqURSwc3y3zf/XfOYL8pV7HtON4UtH51c5SZfPXTuYB8YH1WYHcs4vbouK6qnfcp4RjodxJvl8Vv2msj9vP8nyDbXxzhBk/VDU4VfePekvqnnDeJsMzT5ZgAK6euffIlqJV+RjPtxq3LMAlNAUThQcv6MHTcLALNYYL4X8eaGfgCDOKgMYXRH5v+m8f/YhbEjX69Z+Cw3DGJfHUm1+UmAE9G9cJb1qd914MbujT7TYueYYK5qKEZW91TxDMew7l1019LSzHcpnySHCrC/7HHBqGxTcS0QYkW5XF5hppkUrXW+OnNiPWgnSu7U125Lyd/nfUKWGLGsk+h8kZ5AWMLscKEdjMiWJchWNsqgiGu4/2xQKhQbuL4h2dPeuRc6vcBbWqr4ocdMsWqsrF054geYC6bTqHfbF5xjQ7s629ygN+Bjfp+sqFig2wECtJ2G5jbxjXEPV9cFYz256SfVOWgjJPGK6ThjFdHVd8dT4pjhCwwKnUD1vCnU1zuxn3LeSpLTCoL/yiTnPGWAHKEWZn+vY9e2vQjTjQyrRq6gzdM2yuRCUzUvaAbiZ21y1SZ5RBD25CtOoYPJm//sjmsGtwWCz5/OtI1pd+sDHc1TTAw=="}',
      password: '1'
    }
  ],
  signaturesNumber: 1,
  copayersNumber: 1,
  coin: 'btc',
  network: 'testnet'
},
{
  // file - 1-1 - bch - livenet
  inputs: [
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"ar4T5UJ2NEK7wp0Lck0dDQ==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"Uz1YLBovGAJwnzx8vGgCmyoJb7KRS6cHfasZcw/4wQ+WlZjM6neiTJJ4INCqh/pfOM5cTk6xduBzYMy1s8K/f3Xh5K5fG7MCkcozCOTC4cUUxSx1f/V8MnSYT88+SyMmdMH/ZFiYX4TCoOjx2uJ6kZX9dJE8WQRDQ5C0VdFIgaxfMbgEYGC/5Ih3q2wWPjxLl7feZldvNxXjcgjOB/tpz0vtZ6a5FO6q/FcobIL5bmImy5yGKPWkLhF4HPUqY6G+yiioI9ka+sjCTvoqIu4LM1nCbiTevjVMFRuclof2qX+r61YmUN9mLlWQkAYsVZasnARGvXSft/2hyv8/lb8a/3uRZhNLZ9+mL5A0UDx3cEm8m87QSBV6b0ibbIwMKwUEtSzPTZ75xOd7SKM0si0ktITQ/SSuA+67ucjDLWYHpudHLLjNI6P5oUT2ADHHUVpwxQX/xrDXuC2yRwtgYjBlQcQaNN1Rlw5yVaeLPiI+ddeq17Rv+cCFI8ByGIUO9Xq//jQn1OOII4uPKaD0uUqlEfuPO7jtkP4LkABaIVZPAsN9g6IkPm5cjlp8In5KpMqj9JgKy7A9cTaJDDuDn+aBAQMoLpIt20o3sF0HDHVFRI/ShCl4Emt9ZLmxbgIlglaaJC6lmNFxnqlMLPJEejc5U3s8Mb4MKbV4wNiJjN3T/HNbAEsHmMgMAqRE8YFmhZ9x/vT0h+N5KCoKlLsIaycDSBKlBFWnFC+add47mrqXdwANudBrm1LfMO23hQfzjdW4nDWFyj5aGbLFEcxoergF8nTweaaDcBi7yPErFxL6KtOEo3zzNsbV6+GoWZavxNkqhCNq2Pk/eYQI1jXkm+Qtp68rahc4O9VazfGdQsk+BFtn83qO+4qAN8e+l11nkY7ZdGl4kvbSuX0+AEbHOA8eZAxV0eoCgMsYJXPO6+R/qZI/Fr2FBMMucw9vAPvHXmltGc/VMaTe5SRZtQLodrdZsFmgBU632vPFaZEqh2lAjFA1g5a9uvyvkVjMYsZqau/hsKHNqHkVwY0r5cYBmkr3lSgHZN/Q4FpU6JOmdNn4Trf2VmNMM7U6m8jjYuY4wTqmB59jwEGmN/0LRP0kG3WdSTFJ+VA1Fu1xyIFoaxnri3DTprXq29ViJmWnUTqbr2i7x7AIrLmlPZFpzpbHMmmVXtXa5g3u+I0JpUBF23klXQ6glNSXlxwEiUKF/fzNB/NEImRNlV7m4Sm4SOO7qhuIwg7Rq7DEyqx22y2NYYQtjBfW67zgqmAhzyZic7QKDzrNkfxfTIVzDWialLwdGf+u0hNCbUtgkU9AVBB19R5TuD+h/sf1J+edFyDR3zzFGhckUywFX70SPe7qXe7QUgs0FWW6smKRnvW+/B9cL+ClHiXfZR3F6c6P94MyVFi9Gj54OgRzX1X7B/VlZNm+UeG6J82wcKMeyU5iFaGomvljoDBDG1WNDcD0Nk8uJbs4PBELZCaqeqb2WYI8jQAJZxVheEX0Ekr727aALTNfgnadh4fg+dZY0bey6l2X8aPlMCHCSGC90BZP8reZWfeGtEL0hzRqZVEgogkF0dVLT149XLMANKJidqCjdo4X71Q+GBdxBmNIa0m79bjCJl6JhkqmV5Zma3P+h1Eo8nXWjILhxiEQyM8MD0r/Pk3vSINA0c5U9DLVD/VTGJag6igI1B+x4I8M2zxTT1FH9gOJ6h6I5p5ZTsho2+ROBhUnPVezuswQmITbkoY6NI1+BF+NOPp43IdngNLiAv3qiPxQYY0MXCnd6aip4+cDi5qytD4bGxYQpF//Okxpdc4FvtNmDS7ksBdUeoZuqn9PYT0voaQFww=="}',
      password: '1'
    }
  ],
  signaturesNumber: 1,
  copayersNumber: 1,
  coin: 'bch',
  network: 'livenet'
}, {
  // file - 1-1 - bch - testnet
  inputs: [
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"ylwcSkAz8GBAXHQtNeBf4Q==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"N6F95YWEasTxbgKlDcWMPrKVRDiyJSdvRCdh598bEAZInLOf8GtXQSX3Wg/rwOmIxwKcaY7dtrp6WepX0+Q8yjyyA7zeN5Z65xfueXScEWl/8n4Ir3UCMjCzIpnuFR1bCrlA6KrYwVhk3K07FFjuhIKYNbNA/Q73BGC2CJrtPZ1mw0W/Arj9dbi17YFwGWMvVk2dhq/+ds3k6wga0KI/m6W9SJYWKPEbXhs8IC3Q0BwBGyxySiv6djeTgSHZ24Vz8NOKTqVFHEadwEoRK7mhi2aXW5Bqe7jyCUxuD3CVIISq3g9OnPOdVxFNec/olcTRLfzqFAWXfxvaLNB17KNF8rhXd49Jyk6tn37ijuYReHlUsup/UFLhMFdMjH/Em+etDprrjOUrB7iuCpngvWbxJnggLlbZe/V0azTXthkm82XM3jHrAAqH/BLQ26pRSUvOK2lsLkETHLzkvw1kEbJ2FxPsrOHUj/5G6j92NbFH5X1p38VXo/y6TU2ZYnNxg0bzHTgALMGQKd7qffKD1Ghz4xDI7NVLDxcWo0nIWAE4QHmqNOqED19UWUJR+oAdDOv6nYeubBwtldWLHLfeq53ffa7i9hDeVlDrzoT62/BtNO92zvY0RLn1Cc3mzERim7XjKFQ6/Z7GH/lqfczqiNFGoeDjNrEHMdCGdTwf90DegPZ5js2ji08B388B4TzIeARBFdDTnMI1Yu6h+YHZaxlwUBgIQ6hj9/H2DrvpjVcX7aQ94SQPzspyHrqx+nBunEeISgrUGoCNc0Hqe116k34NvE3CiMkLybtR0nhQZBK3HDlipgfmcbx/WkEnlNV6VASZj1sUJp08dRBzvjxZWzaDc45knTYBK7z5uiEfafID8nuUvDzfyZDvQBHrJpt//c7x1repgGsUvVHAfTyb/tUMKcU0aijMeRwf8GJxqGM/fFGyOD+CjL2CCCfYop9t/uR4g54OrfvPIq3q1X1sCLQtPKXGd82Cwt3EnQ2fUohZ8LTg9MCJRB6kbTk37Dh8NbOMEnuerZKixukdOu5VGhNWlxzkmRIFveqGW0FJCSLxKnkaDTnOcXb0Drg8qJ9AmkrmcpLXCKgfqhtFWQi6SSMs+XmQg2l8YoeuLoc6kGYYA9NZ5rbe2oqA/NPVvsUMM2PAAXawYcA+TkU6VZN97bZ/06jEA8tLuNtIkofE75PRKJJlpX8fOIN9PPgBtsdEFEtKlvFO8Dy+NqHE895pBbZA4lHO6LmZ4uAqfhSprW5Ca++R9eh/AVnQhwJVgU6l3auz6ZPv3Ym1tm2HSIYlikkiUotBa9Nhxg4TO9DhBoMjlhzlCFR3tF+/AC84wnFp0qJl0iBP20+w/CYAtloe4EJgTl0ZAzWzGKOEDLtBUdtTKieSBE98qbMY8j0VnEmOvZAp3WVvhmED72YGbT63nKanQ+gyQXNQokdZnyup0FYhSofSzrKLUufhHrQfgK6zryE4PGm3YMAogKIlZC+fpI1ZFJB3QxrMnwj8H+oGUCOu/vmiFm1DxWwixW2RKoZmYx8cpPn3gJIjCywKyESeW/dtuCJYfe/FJRJyQxBxTaH1ZIuuPwqfaTMZq330umnNsyUrPDlCxLoUSvlGA9T5dMooxzhRNvY7mjf/8s9aYFgfXAZ2xAD34E9k/SIedVcUYu3/pK0mX+rdxlE5vzca0c5iq2T/Yp6uZMCf9ixOntD2OP4zUIPNiHQm+5cThNjP6mR7ZsdtJd1Qp6JguAwFmsIGeadVBHNqdiFScKdpAJvbETaRwJLso5ca9oWv8oy4HJjFKL+7PoqCN91KQifUJFjO1csxSgyu9d4QP1M3RYlfzgEVhWRXnAmBnfZg"}',
      password: '1'
    }
  ],
  signaturesNumber: 1,
  copayersNumber: 1,
  coin: 'bch',
  network: 'testnet'
}, {
  // file - 2-2 - btc - livenet
  inputs: [
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"7XHxWUjmTHMtXH+KpkEGqQ==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"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"}',
      password: '1'
    },
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"6Lj6lxj+tW85nfGL+ogpRw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"j5+2g+lzZhE=","ct":"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"}',
      password: '1'
    }
  ],
  signaturesNumber: 2,
  copayersNumber: 2,
  coin: 'btc',
  network: 'livenet'
}, {
  // file - 2-2 - btc - testnet
  inputs: [
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"gm1zaPVe6WPvWteLto3MeQ==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"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"}',
      password: '1'
    },
    { // tslint:disable-next-line:max-line-length
      backup: '{"iv":"PeRqPL0qii96ZvKwls6Axw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"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"}',
      password: '1'
    }
  ],
  signaturesNumber: 2,
  copayersNumber: 2,
  coin: 'btc',
  network: 'testnet'
}];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecoveryService,
        HttpClient,
        HttpHandler
      ]
    });
    recoveryService = TestBed.get(RecoveryService);
  });

  it('should be created', () => {
    expect(recoveryService).toBeTruthy();
  });

  it('should return null if in angular crypto config file crypto variable is set true', () => {
    expect(recoveryService.checkAngularCryptoConfig()).toBeNull();
  });


  describe('with mnemonics', () => {

    it('should return a wallet', () => {
      testMnemonicsInputs.forEach(element => {
        // tslint:disable-next-line:max-line-length
        expect(recoveryService.getWallet(element.inputs, element.signaturesNumber, element.copayersNumber, element.coin, element.network)).toBeTruthy();
      });
    });
    it('should not accept unknown coins', () => {
      const testInput = {
        // mnemonics - 1-1 - btg - livenet
        inputs: [{ backup: 'mom mom mom mom mom mom mom mom mom mom mom mom' }],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btg',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Unknown coin btg'));
    });
    it('should not accept invalid mnemonics', () => {
      const testInput = {
        // mnemonics - 1-2 - btc - livenet
        inputs: [{ backup: 'mom mom mom mom mom mom mom mom mom mom mom dad' }],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Mnemonic wallet seed is not valid.'));
    });
  });

  describe('with backup file', () => {

    it('should return a wallet', () => {
      testFileInputs.forEach(element => {
        // tslint:disable-next-line:max-line-length
        expect(recoveryService.getWallet(element.inputs, element.signaturesNumber, element.copayersNumber, element.coin, element.network)).toBeTruthy();
      });
    });
    it('should not accept invalid json files', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { backup: '{' }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('JSON invalid. Please copy only the text within (and including) the { } brackets around it.'));
    });
    it('should not accept incorrect passwords', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"j9exgLZQ+1kuxitBzHbTGQ==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"XEgMRLY3Tj7qtOj0NXZEjmlQxHLuNusfQ3KjgQChcOh2+O3mlyKqfLbRFsbvduZKADiTGSZ7HFb9TZeEnXqDLvW96C05FdXF5kVJTbbaL5QKRvXBBG5u7yFUp+r3ChIY29MQNtUn/HijW4WampkCgnm28GB9mCN5lLZL59eHXZ8goT13h1xtM7fvtOoGK7NuVGU8XbE2E1wak6MQvum+uV6oxwNGCmiwdBy8koCla1xvB9O0fiEZFAnWTl3ubgczsdcSo/1nuivXolraVIsDNld/NecGMYaEI0kAiiu2B2yRN0KkrzYXXooU5xJTXQ+gAMuat3S0KtLFR1Rwd7rDGwUMNRPMMFHY6PfOz/T8EiXAJbqRJi7bPjEVDiG5L2l0bnq2pYMIs3OlkPd1sF+HeSCeMihWGmw9MyRwKR5JQb03ksFXTeICVGl2BJ8tHdV/TTK7lho4L5f3lMnkNjCd1VQPhmF63NIIK9hclMFo3V501co++vesUj4itti4/dfS/acl8rJIycRrBQ0aorU9xWvNgSrQNVVAWN4pxVbtIRSAuDuErxcNUUsGCn8fOsGGYiYWEMPE8c8fItUDZg6WAJ9hy9SqliHXVevYKVZbPh6Vks+5ZJsyp3OBgHA725QceHoyJvBXwvQP0cONN9yyFDziYMLLB3xDd8Zizu/kXT58Yh5/U3VjgbvRsMQixJgKNZL4YjBgHwwbMJ+LtFMSEUCINJeVNR08tcx9D+wTBCswfWO3hCzebkcVwM34QhPrlgMoq1BNQJSRVIaXsNV0S5Gmj/paQ5p0a1cCKEb8k4poj8m+pyAPBlPqzN2Yruymix3hx8ukvZdhALDUh0qZbMbtu4g+7FHANWCmy7zxWAk6C0q24raXj3w/Farg7FBe8UrdrzaZNqWk8FUE4PVZS3Rt8o5a4zrOsmu2SoIQ5mERlKJwvqJjkE2B7ndaFIZ+To8WFhopdPdkp11sFMz70t1EwNW+7qyXhLD7/BwyezsGanUxJdkuBL9Zp1uXiP+kO0uC8ogBFO2H/3Be+DSWi02Oa6Zerk9+pAGBz9wltISfn7uuJZNznQN/7SSGU/2Mtbva0/uleKF8ir4JC0gccbbzvrHwrR7uW0k5slyIvEv32kZfNMRvj1xaEMiZXWkehFGT1kJV9BOg5ri/k5exXj9ZspusRSAB09S2+CX0NXgXhMe/Vas8PRZoVV/uPQKLJYqZFTCwtU+fYZX3p1imto6bCyVWaMf7pw9Z5MvSgdCIxwO1sB4PVDQxWsHNX3SxbY3GP5k0NCLmnxje6fYioZFf8mCcIbcB3oW5WiS22kZUyHy9yKiVpSNsgLuM/RSthHYOUORHxw6fMWPNUuX8cm8qnC6MhAoIUOJaRiPneCkvnPD19f7ESOhrx+mharwekIRnUZHK4SFIVzTRZeY55zJLNCgqQEF0BTYGz4mufLah8Rf4GnLHml8pmOB4eY4QyixC+t5o/GBO0GR2t2Y2s/JAa7xOufapeeQrRKZ0zMz9QmpFKQYxtfYmpZbwtzahjW5eVjuvfnNVYUFf9LY1J42PjewFLcf+e0l+fDN75LXFEH9CXtVCfOnalo9xEJ6595oEjj8w393SzdBOx1bNL6l5RQiPo2BDCklwFSGS472XaHm9pgKkkxmD/UrKP5AyDAVNv48hlkXmugy9AEQvHyU5AsvfmTqZ+24n6Y4MTgPo9ZOv7eqz1oCFC6tvNazG9xauIx0LTly71Q/WC38+iKluqla+FzUz6B3RzakK6gOimuLrkLFBoM/i6/9hmaWW8de/WnpuVDkv4q+Ud1pZLhSssAl7Zg3uohWopQs="}',
            password: '2'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Incorrect backup password'));
    });
    it('should not accept incorrect backup format', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"j9exgLZQ+1kuxitBzHbTGQ==", "v":1, "iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"XEgMRLY3Tj7qtOj0NXZEjmlQxHLuNusfQ3KjgQChcOh2+O3mlyKqfLbRFsbvduZKADiTGSZ7HFb9TZeEnXqDLvW96C05FdXF5kVJTbbaL5QKRvXBBG5u7yFUp+r3ChIY29MQNtUn/HijW4WampkCgnm28GB9mCN5lLZL59eHXZ8goT13h1xtM7fvtOoGK7NuVGU8XbE2E1wak6MQvum+uV6oxwNGCmiwdBy8koCla1xvB9O0fiEZFAnWTl3ubgczsdcSo/1nuivXolraVIsDNld/NecGMYaEI0kAiiu2B2yRN0KkrzYXXooU5xJTXQ+gAMuat3S0KtLFR1Rwd7rDGwUMNRPMMFHY6PfOz/T8EiXAJbqRJi7bPjEVDiG5L2l0bnq2pYMIs3OlkPd1sF+HeSCeMihWGmw9MyRwKR5JQb03ksFXTeICVGl2BJ8tHdV/TTK7lho4L5f3lMnkNjCd1VQPhmF63NIIK9hclMFo3V501co++vesUj4itti4/dfS/acl8rJIycRrBQ0aorU9xWvNgSrQNVVAWN4pxVbtIRSAuDuErxcNUUsGCn8fOsGGYiYWEMPE8c8fItUDZg6WAJ9hy9SqliHXVevYKVZbPh6Vks+5ZJsyp3OBgHA725QceHoyJvBXwvQP0cONN9yyFDziYMLLB3xDd8Zizu/kXT58Yh5/U3VjgbvRsMQixJgKNZL4YjBgHwwbMJ+LtFMSEUCINJeVNR08tcx9D+wTBCswfWO3hCzebkcVwM34QhPrlgMoq1BNQJSRVIaXsNV0S5Gmj/paQ5p0a1cCKEb8k4poj8m+pyAPBlPqzN2Yruymix3hx8ukvZdhALDUh0qZbMbtu4g+7FHANWCmy7zxWAk6C0q24raXj3w/Farg7FBe8UrdrzaZNqWk8FUE4PVZS3Rt8o5a4zrOsmu2SoIQ5mERlKJwvqJjkE2B7ndaFIZ+To8WFhopdPdkp11sFMz70t1EwNW+7qyXhLD7/BwyezsGanUxJdkuBL9Zp1uXiP+kO0uC8ogBFO2H/3Be+DSWi02Oa6Zerk9+pAGBz9wltISfn7uuJZNznQN/7SSGU/2Mtbva0/uleKF8ir4JC0gccbbzvrHwrR7uW0k5slyR/x2qkxB4J8F1oU1zQJvNLjxVlFmH2EUF8BSk6OvvxJHiXmxY68r+TiBUjYew8yWqZX5GjsG2Vf5sbEM6Vw7vawfcIIHOEzW3thbOa8OhoRu5rcybTXQVJNbykBJV+NPOsNeF0jGgvVVbETwecZe9M0XCb5jjM9xlXAzvuGTYtM55+fgdtWTJfedImLO/WCSqzndTxWmP3aXe8WZxtYvHnnW4llcLX9Qr4kmQC1enZ6L4IxVN4mSI1kdLBaVLZzLrZG5n8Oj3svDcB/9hiKrtbrFZx8llUYGcuiNFWTLPZeY19TREOighR1NiDzYDz4Gtbffi8QvkATOTiVgqg+BtapEQ0GXvCdIn9mDwOGI/oS8uu/dIdfXoWbSlYOmGt6Z/2ML9EmYBLQIk5bV0uavrsCuykR8LAXmuI2Zdd0cN/LhmKt6Nje1UJsSve0h4LWN55OqSFyobD4UXK+7SwY1wRp+w8Z8H2mhqjtmCz4EUnwWaKvwkTQqcuXRKVUg/Vm2W7pCbdEe1tjm1iDuD/VyYbYQyExMKqcskn0Tq4E+tDFkoOjA/CtDUrTfJoDgAx6caQAOGnqL4uqfqmpXEUvQ2ebuLoFbuaB8KV2iyzgfOHk8yla468ValDT498AjH3L5DuxGSh+Drwfg3iY3Xgo1h5bWn3vvvEyt8cjIy7P7dbmhLmiXUWUGo/lQ="}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      expect(() => {
        // tslint:disable-next-line:max-line-length
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Backup format not recognized. If you are using a Copay Beta backup and version is older than 0.10, please see: https://github.com/bitpay/copay/issues/4730#issuecomment-244522614'));
    });
    it('should check if wallet configuration match with the values provided', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"pxHJvaSkHsqyPjgOZCeO9A==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"Ir9uwZimvjMsmT6h9MjiZ4S8erGQp01TRiziLtJx1XOFgBU4D67tOgz0fipTDMOh/rsiV+fluAnSFrISwnn/nEs0JTW2LzFv7yLHgjqQ8yrL6j9dlggFghA7OZxBvdPJFLEDMFAAF+t7UUotpaU7cG/SFv40Ga6ZNWOlNqlseIsGeABu7Ss6kiIxVdkLDzf264PMmU+BdBAaKgBKmnQPhm942RccBR2zghKjt2hh025YLmumiRnHybD6eNYjxAU/7wTbk7ldYvuWwL+QgOinLmU2S5CPnA+Azx8cs9EoF9T2GJ5mlLkpO2u91AS675fGvPBaMpqZcweLmZc0nWQqlqsTjRezwe0MqlpzuyKFr2dcfNWEHnp4w7nPqH/frU3V4kZFQi6q8mF416IpDnwunk3EOOmRZXLOs/iyrr+1B24szIwQtYbOcuBYjAFSsDItwCJjOWPwHuiEb7vV7p9xKgU3lDY8ihgUvqHgxbkMLpU1LEltEzUjJoPVkLi8eSk4Hi2cHXpU2TENLJxC3w6qyzL7rUai6PEhAXYXtO7w/7yWuHcaAwIBBudmdJ15MZKiw8gwc2ccy5K99CKSfEE4lHG8q9AYTs3PYSTRzQhBCdeA66ClkdGYTdsG3z8ZBng9SO7W0IVj7TT2KmljL6MOuJA9IfNyW6biAofe7/nQ5rD34c/ecuAkOIZB2t4B6MMheyPWNds6yfcBjdk6dRE+1xMC3q4O4b6tDT+Rq5FDIRTRl5pct1q2ucYp70xSEzv570AiOIq+DACw9/yYqVeSHvmW/xwc4WkoILqft5EJ/vOslt/wApWW8gwY0dPIMPc/Rk7AL98q9EA4okY5lukypkKgaCB2TYW1x0Pqclc6rQj9zvHmg9RGZJD3BP6HAbVnjSnSGf1fkMCAc/ipOZc1PKraCKfYi4gzSs4R6Y4j6U8PFcavSgzqJ04iy20YeW4GEhhnp0W3PPEohcLEIiH8WiClYKeo7y5I7ogC62NX5VbHQ1rlAOX4RV9BbAV1dEYV/P2Ssy2TaRM6BJ+A4U7owcaK/5Mah8xQrCHYTCEpvuhqFiCoTexXu2vZRsPmHe/B8MlDeAaFTRCZxKfRgF0jAjKTK2BeE94u4lN/lP4WvzSWUe9pvWo7H4rLAXsB2gcXx7euw3QE89+voZs3t1L7Kk4iz109jFhawO4tOq5Bf5ho+t9j2K3fAMqWG5MDDoTaWdf/Qwgj1f73ajXAGGqDerBBhaSwQCjw6Y0kPXhOhNsAMcPbpi3GDezmFq2xBde4pbbWfTqOmgIpsvxCHNkXVK9w7yOeMm+UFxkeKhU8zvAKek85pW9Ll+CopHC0nb40RV05M94adi+6Myr7vOGgpK0k2fHP/iVR1SJGFMkxeT7f6esDl6ytW1vST7wmHMLYkB6uNGjTHMzhqph8M+Z9jk6vP6L3CtYvRLCMBqb11GHclC91EJ5ZoeMj7fB+4ZRm3NLVWQrKgspeFh2jBZeFjK9Ch8HihCn/0H0qw9RHFIkNeSDnoCWqFoyFTIwS1g/7TvR0MFMt9RLVsZRSUh1z3Pka3ZDL+6WMM+Jre3WeT8IKHDjbBYIW+4zuXPwjLl5yQBk86TtzQFmiYayMjTudKCYvZb4CHeeEWkg+eQF/LyEGKVe9CYbOFWnyU9s6GG6qBGHawxcX3oIBdE2O+9TBVz/eDCboTlyji6FCicixqWWqOHKGKH+O+4G16GAtZOBI9lymevGQCVZZG1ZoyJCx8FxLQC5WgeLymTnfRuizmuiECxADacwLfbU899LB/C0BLZ+SUTbjUXovyRhV0sgtMdmSzPNrEcZ0kYT6GP8="}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('The wallet configuration (m-n) does not match with values provided.'));
    });
    it('should check if wallet network match with the value provided', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"Agw3pkhHVqWypiRcjXaDkA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"d9pj1kEof5wi+G8h2GZlEtIoNOt0/gfN8lt65319kG/w2oHYJ8eWUlxF97GQr+1cGkz2LNPlBH4k7ryfP32ObGiVsIQxbJDVGnHqob4KECIWpGos8h7ev+1PxRf6S7wmMsXgLNPamaEvLdHnREGzo6bPecF5fWEN5v5gTB/ZpAOmORSqdl8XaWGPnkKMebqTQjhdeuUkgQqjm3x+WS6AAfq8dJj6pTWuhhtzdkrXoEblEoyfZNK7C0svfm55aB6fJX4vz2G+In4p+b6CF2MmDAMtf3I8yc8dAkllvwfFauHYNIkMtf/DdBHF18XOX+fq7DqCNMacja0t/Gr+4Hojeic7yd/pwJ8FmccxwvPCrAqjXN7vC/cYlo8Jyc9PEe6JdewEr8k7E0jSs5MS74pLgKi+CabNUrpgAcoZr+t5KaLEbYbpuR1g5MeQLGut8dNLQx3jtgevi9TqV2mV3yB/homJwuzc9q+RSBOzVG0LEqQDqrOMohbMEX94SJlJEa5aq+NvLOsWDKolCKiNb2SqSy4VhYdLgAYxisdXp9jGwXWzNBL+HtxoLF2tqAs78uLXZ/iUEdv9vkZzMYTTmk694HZWCJrmicRpd3A8QO4wZ163wah5vcTniepQu6MjxsgAsY7wZev1CDick0PQLFbtkoZDkirFTLi6r6zCjFjfub1/K1Sch7u3klfW5N9X7+Zwq6fbV/f0XzhzQg4+MDpPO6uOCrerEl2sC0mOHk/0OAGiMcP72P9dW60VJ1FI7bIDqAJllGBdD91N+Vrr9lg+OyX5h5QJrBMeOWWSBgpXRyCr43hg+eBKB7sizZg7SUy+W70lmnm9SynivuRtEcFEzJEDJ+aXxHdzv7g8dHmRI/PrrNZi+Cz0faVnllwh4odWckwtP4KBZeD0T0BCTwG17h1cQBULJxClI0Zfe24/RhGU3O7vEKRNJEbfM1YQ99fPgHO4NsgAda0J9F5UCUJJMMIPiocfbsStI9wuJTx1zTlsApifS6sE8fbMp2IeKgN7sL+rFU3bTwE++E12aczLykgOWmsCIYTydX7pb+Nj2aAQ7lPJJemUy21yZGj1s68pEsYzyYTAZ7HMCrKf1njkKR3oW4AOtlnPl5VlwryEXcUGuY9rbtMebrLvEdwgcMZJPbcJrF4QGvau2KDKwBtnLDPSu3e6Z/UeAFjrbDINm4gCYKbYO5Qf/ox1NyX5I7pi/mro5LYlbe1I7nf43eN5uhzf5KBJJs22o66x6EWiJ09SlCsJebE/5fpQJX3FTgYqYyPxHCiR6UJQEoEED204ZlZpTa577XtV13vwTxNLX30e2/TDMYFmHUQ4mifTYg2vEKkANPRZTiBRw/CNjrmPWb/jtCgd3J33d2i5ReovJeA8kxt6PJjd8bMDUcTKtnmhKjyHxqx7n63D6h6avhrxzaqIUp4jfuDrFnlgUxcytrZROED0aV9hhYs2L66GZvs91H1Lo6SZhaihZ0ultJbvdPjg2nS77bqcM7wNkAp5ySH3LUWcay6jnJiyOrazONOOPfFK/mz6kuhlIBFa4W/e0QLYUvuMI+gd1H8gxVRIN6sOy1/Ptrntz5wE4kAMC9T4ypSsygQtl5xZYEOnVNLztUHn9c27gwCyaY1eTu4mUrCXTlfiIPaFm8Wf6+JimMnARjzjjg7W2oZHPtLXNZIoDLgMn57DE2VpWnvnYofzwycrpXIeSTZAyAmTsIddtc3bPhDTehOJPyI78eXMzcxYZ+zqqy0Mo3jFBtMkvTaT1Ciu8AZKNR1aUTZ3rIlA5Pcow0Iz7qzfbqN46bw0RrupOvOAGgBfncq+o1CPL78="}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Incorrect network.'));
    });
    it('should check if wallet backup provided has private key', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"SGDJ3RXDMsh5JJ42n2CKxA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"tuWsdeJu+fE=","ct":"+2NJ5i42mykAHOYsQC+9CGK8V6opj0bv76DZOnPtIuIahKpxsD0QUXDeBM/4LGad72eBtdS7zwQ593fCz5FnOevxaoNj1FeJ80enIkIUnb5ZAYYV1bXcLn1mKuNhJGfiL8yvh6Q6rpY4xknyuHQGXJRP72uQCncoEysVtBN7rY09G3WsDZGFKGmo9mrPXoiMUL6oZhKdJdhiuYLt7WLmxx0P5Tx5Ayle6uNxpDm+qJIjUMrBSavEaX8gY9mH1WMZty3vywO1SyE6K66zQnfWXyahLrej6+5WA0NgSqNaBRnXhRpf4YdPHXYaRRKxXbwmNTyPd13iJQeSV1WCYorAK9dxlk5kjKjrD0X7LmRS6e7zYauBQeT4/va6dSE8asHgAIORbasC7WOGJqq3QQix2iwAcxOg0tTQ96eR1osd6WJPAyt9PsrZZIKnCp5hI3PNY5468uXgXXeXqmM3ct16FrQnVaidFJcixKO7X3ImBT3T2JY10BI9h/7OJpfSDCdZjhqQoishC7QM3rucfVoSQI4C96Bz2NsapDktqDOTL79gnETa+BHhQAPENkFmJ3e5FzCv1RVmx4hHuTKIbnKlcJM0cA7fR8mg2vLEas3mTp5Evzf11kcGN1496GTP0W3lML41iBatg2TEonVYA3jD9wl6bq1huERBqA52mbfWZZ6dWAprwsd9M9hslmkD176HD9JHO0flTyEVWlRi6cAxv+3+iS1W1aRQIOYeeCKqGIKHsMNq+mXJk4WVlubJv5GUDOCkoPEjRRpZoUmzPrRCha2eQs5kapgRLrsh4bwa+Gkbdm3QOKL3KmKUsVsju272Dgpaq7kmAYAdd6NWlRsCEv2xrCiWPzipk+ciFv1iabh8TC0oJMJg6afWePXCCgnivQO7cSzVdKbCR2UJvr8hA+4PToBmXLQNiCyBaYx+yBJSU/SljZC4DEYKuQBmzkWkoiRpsSTgNPN6DekYKn34KILAJHvE6cwRmZf38dzqhqi4EDKf7UbCKFWG3CWADdlQ+Cu4kWrZDx+/qTTDn+dNXaSwMZGr2CIcPupv6YwqdClf9f6VpGLO8njn6BIBcFP9cmrewQCbEmtsbpjfiERq8K38WRuept76dZmVxtthj90CRPdfbMlq09NK+nFrM3mQVby6jzcAyku5qLYghmShjoZJjvwK9KJtoBRFkIh2GagATfznP8vDr2mRNPEqDKcBIe+cH1O9k8iP+hOk/dqwv+8j9DNXbPHlTjuaWD6f4tKrdPsu2zK+THGcX8L66ndzgELV/1i5RzLmW7AY3YWWbaskHiLOXDnjTQeF3wdiAy+oxuwYvNTdwTKiv21A0+er6aS+Kh7lijdMi9etRQcn5IWE3Qyq0lkG7aZ1AqWKrF6URnFFrXQgzSGu+hIru5liwjG7OLBG3uHkREZGa6DXMwWptYjr2zevQWiC2YvuCqNyKQmHdoG0l/LZMusqvyjC01pQIf0xqKwJm94dP5bngxDpkqis50lkXK0PHGkVaFbRMLntJvrIisAyHQyyNhNEP6Srap598FHOc1ZiVMW5u1D/OmR1uXIMnftd6A=="}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('The backup does not have a private key'));
    });
    it('should return error if xPriv password is incorrect', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"WxPttG4oqN8havgaXJMvuA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"bpBSos6RiRQ=","ct":"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"}',
            password: '1',
            xPrivPass: '2'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'testnet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Can not decrypt private key'));
    });
    it('should decrypt xPrivEncrypted with xPrivPass provided', () => {
      const testInput = {
        // file - 1-1 - btc - livenet
        inputs: [
          { // tslint:disable-next-line:max-line-length
            backup: '{"iv":"WxPttG4oqN8havgaXJMvuA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"bpBSos6RiRQ=","ct":"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"}',
            password: '1',
            xPrivPass: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'testnet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toBeTruthy();
    });
  });

  describe('build wallet function', () => {

    it('if no backup should return no data provided', () => {
      const testInput = {
        // mnemonics or file - 1-1 - btc - livenet
        inputs: null,
        signaturesNumber: 1,
        copayersNumber: 1,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('No data provided'));
    });
    it('should not accept mixed backups sources', () => {
      const testInput = {
        // mnemonics - file - 1-2 - btc - livenet
        inputs: [
          { backup: 'salsa almíbar roer malo anillo deseo ruptura manco ancla chancla mes sangre' },
          // tslint:disable-next-line:max-line-length
          {
            backup: '{"iv":"cegFGBFNZKHjbORTBv+kCA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"DDUPG7GnZ7Q=","ct":"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"}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 2,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Mixed backup sources not supported'));
    });
    it('should not accept backups files from different wallets', () => {
      const testInput = {
        // mnemonics - 1-2 - btc - livenet
        inputs: [
          {
            // tslint:disable-next-line:max-line-length
            backup: '{"iv":"2XxeXFUjdXVC+oH1rWR73w==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"7PHtqG/yfzo=","ct":"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"}',
            password: '1'
          },
          {
            // tslint:disable-next-line:max-line-length
            backup: '{"iv":"q0poHc7oAvYx4Ial4ed7bw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"cQKRAmrgfmA=","ct":"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"}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 2,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Backups do not belong to the same wallets.'));
    });
    it('should not accept same backup file', () => {
      const testInput = {
        // mnemonics - 1-2 - btc - livenet
        inputs: [
          {
            // tslint:disable-next-line:max-line-length
            backup: '{"iv":"2XxeXFUjdXVC+oH1rWR73w==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"7PHtqG/yfzo=","ct":"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"}',
            password: '1'
          },
          {
            // tslint:disable-next-line:max-line-length
            backup: '{"iv":"2XxeXFUjdXVC+oH1rWR73w==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"7PHtqG/yfzo=","ct":"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"}',
            password: '1'
          }
        ],
        signaturesNumber: 1,
        copayersNumber: 2,
        coin: 'btc',
        network: 'livenet'
      };
      // tslint:disable-next-line:max-line-length
      expect(() => {
        recoveryService.getWallet(testInput.inputs, testInput.signaturesNumber, testInput.copayersNumber, testInput.coin, testInput.network);
      }).toThrow(new Error('Some of the backups belong to the same copayers'));
    });
  });
});
