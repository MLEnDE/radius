/**
 * Radius v0.2 — Client-Side Encrypted Personal Vault (PBKDF2-HMAC-SHA256 + Authenticated Keystream)
 * Ensures zero plaintext personal data is stored in the public repository while allowing
 * 1-tap passphrase unlock or custom .local.json import/export on Google Pixel 9.
 */
(function (global) {
  "use strict";

  const DEFAULT_ENCRYPTED_VAULT = {"v": 1, "iter": 25000, "salt": "H9GDqfRr5WBbcwSOK1uiig==", "iv": "ACZ+5OaEtGselorFYJjrHQ==", "tag": "HExaMJb4W32tync/xeDAfI3qFG/D1ed3nF9aiBkRKFo=", "ct": "rCUjrV/xdVUeTlxyLmKs/CgEK9Zqr5y3Rl81Ib0/CPZp26HSxL2nhGLn3QeTjNRn8Trs3v59WmtqKXql1mk2YaTr+lJzBUqsLQH7aFtzqmYW3BSuvGHwl16Wr/8Fbl5+iWNJ/pbCSFF5dUIF+mkLIwRrrJ2E8DXgPPgPD8Uv2xuJEIPvhEO/v8hEWwrx1Ic0epURE4fT8Fc+gSClQbgsblQzFyI7PU1S3xZhpuF9Tm4n3OTsVRQb9iakjyVD+lL8Y1CjIePq8MG3H6yM5akaO+5lWnf6Go//K5b//P1lTyd040LMTK1pZkW+4LwqHvW72PbgD9bA476fdkNrpMbdnM7lcJMi/AS3WnO7jLYurH2VR2jDkCu00WCQBfKKMv0am2qSikx/TI9Asdiz6cA/QrAav1UKAFzhoC0M8LvtefsAy/34jy7jxDVK9WbT/W63d73Mv31x7WC6WCY/rNM2HeatfGQEXfef9n2wcMdV0rYm0SVjWn5E2KsLwIZnKyChyUl5n9oIPTm2RiOFxzKck8PjEio2yMxSGz5F4L81+yaoauFwDmYvgm3YZ7o0kJTzmWzeI6B9YSy9ApiW1tew8VLEmjkSNB1ZvHzIpnfsYUdYgipwD51haq5/W4lRZ5MxOpVdDGUkIJzyD4cu5QIqD8WIkH5eCekGReHl1cV7O5YWlNr/IFfnNBcC9y1egPyy11Uf+7baM3LPpk7OuQvECEr+EMb80Lsglox1qaY35OjJhhI+xzxxr2PNS/hjX99gutASwEicS8zGvK3AzrbMuL07gxGBc4iDWB4Xuiq40znLjzNxXz+rm4B3olTFTnty/O4phJgJx+XTYOmX5aAyu+peM0J/cSgT35NESxqIEXs4wjjY1ciZwwOR5Pod7fWrFtYeux987yZNLLnmZGx7DFyQW6zeyM9VHSYrCX1HFxD57UR7+TD8g1kHLSxE87mqItlpOFJjkgPvyI7o1nOmEVTs4OlnXRwqwWDSBPUxXulXjzx+Ku1w82otVY/8wSuaM0zmdGAcNovr6Blml9RuuC9s2l5OUZcFoS7gDTbcYNperJIphs0t7X/Zcf/g9XxZBMqiW2y22rjrDvkfYjOiEOdCXyFKs40WxppNnfVI7n03WKiuIfvvZnoDF5Re2i774hYMhAEFUJE0At5hCaXUafsbx9VJmK9oSgIXv7LyZHxhfwhdTOnguIRWdpqITI5mNzr6yQlRc6Bumk35kvgQWHzmQ39OmX/wKrvtSPAlagbktXyZJMx8gGHL5JQ9XqKfS4MYTdsmrCD1UXCCbNg5OlDinfHtUoPM5YENwjIBWg/qUlML5zGQdGSQEtIP9hsA5NdGm+fGnqQvkxSZF4hYPBQQOrzLNxuN5Q9t2VnR6hm/9+fkA5tmQ0gGQE4Gk+JZBmXPXsRNA++NT13k5YPg2AWcXe/7oyrqh14+m4xDk+hStpceOTPEvfUyNcMvB0p9NXUWU9qrRxxgdx2b8gQ4gmZ6domY/Y9PdbunU9hNOYRSC8SFU2TO6eXq3w6D7/OHj1yA3gBf1Afscug93J7RHPPuPBAQlCh24ypUJQWxiGvt+8wS9XVEUDgf6ohH7OTgjCrbNDVhgRV4FT4hmtysQSDq8RpRh7I6bIu3DAVoWssXZySbIoUctV6607iJAcGd4yxSsRwEuIByCnFi2haEJ2D44V/q8x6ADTSSJToHFMAeesJVjmlCuBRR0AhwhRJEkRh999rYH9bl+SBgglOkRA7y17WUBoT/AxchKK5HQTJP7RP0w1rc6OES13IrMDkCiZS5Bkc23M7QHrViwS+/4QrOVkIBI04illee/Us2hptV+W3ih5+J+9BWy1Of+NgUFnBWGDx1opq/Lmkb0U8gsOpHTzINC6ZczGC7q1KFFkwJMncynLr4pmus6Lo71Dn4uuk4g/LSpEpnlrTDwz6gjcIY7fz/uTANkyU9l3hmXdiTNg3hCQdBfeqnUXXYkOOARK0FQTEvVVN+/WjSHfJUl0nXPRcVOIv7wDJ/atUHUbxoIM9DwXR517cWUn4kAwsFGUAmjJjaFY4LfILXjWjz2nxhYDcG25YBv0OT2OSayD+ojDTBzSmuX19Pf82TJ+LLi4J/vRDHiL07kpP94Zs7HQ9RepCoI8iNwt9Ajhbgz9ar/P8bftCentu/68KHbEhUaiJ+sitmV4b/I5lRWf57BkXe2aHctpCkIO/SN9Cpg0k7x0D+obYXoblFAtYsXEsCNYgSh7KRHC2OfNj5Znh+TmyNjBkHkBXG/wJI7xt2ci7AgOVNQx+rEjoPusNpXn53XG3WuXT8yWv/eDKHmVpJUQBd+TCUSci8xdonLF3JgGPjoEHWBEeB1V9Q4N7iiZDZQvKnA2e5UxynDepslQ/wQiOZxlpf5WkIc8YwZDMDmc0UgT1gF0fCQrnNo8E2MSkE4pb7p2MF8raRtrCeamJHho4aN+Gf6MdQYx/n1uTO8Imve1qpJHd4ouo9noLPfDPRaUyoWECZsdH6jTsE3fT4fabuTuif2ONuJ8qk3FxqX9Dug0QpxQMmu+xw3VQdzjdv0tikcrtvWb5wwZ4Tw1LUf9GNRjFo/f1DlSU4Cu0CE8krDVMsdLqIMoA48Nm+8L0aJiYt0s7jkExLBOpQ7np/f94BjZX2QV10EcGcECjezwbuqdXMuF1XTbabihJjjxwxAM9bIqaWGKkQgiFKcGhuHctN0qjHHEO7+oG4TVLaDsmCu/UzHklJBfM8442NS80aEUloVwDnHOcDrAUTOWSSlWrBIxksWxWsiMOaI9nVxU55eD8zacNnbuds/21fWy3AHtGNl23UqEjPF4lu8L88t1FXA61FgEgaD/bKF6ZAeMWfbXDYOAAxvM+SfGup44EGIpi9wfMkZ5/rWN/ZX8Xyq6MJBwdHfheFtU6AZeGo1SfvmfwcYB7D9kIdKxY8lrUG/6xqXER4MELJiBclBbRJGRfP8pODLnWQxll5qjMuL2RPsJCdsjrWPweUH7C6Jhe4kmO+6pRqbb6+BZYNBzSpPiaToF4YBbKtt8b2iYSGSuu+CecCDz9ORs181nu2oMbiVxtDTXuDI69eMFM3uBXeZb5NppWoYhMCd43zNaOJQVjzMI8oBGPLLeKVB8xlcbgxNMNnIY78ckhuq/8WAK5EhSt2AaJeZKGLhyZWhqH37x4ad/wgQpfsTaH3jbQJi8lHX9FkbecBjJoiV29MXe6KwtHuSk42do4dezPDACN01S8AWs79gH7T2oNnmlplE52D5wQdG71hQxk0BYEG2G0PJcCfIqE1mU+W8G8jfd757HsZ2ROBYzYeLAbZdNzMOFlsW+JN+YB0ut4X0XfMJo7bn8L0t5BdOQe4cxDIbAOrCNVvfH0kmrJx1rHpKt9Q4F9c5tw7/BkLcvKM7VrgenjSLUtCkKQ1MV9LXChcIydisZpM7srNwmwAAu6aa4jRsPR1kzCZmqPGXSUuVAfaRnoGJS44YO2DlzY09wT48Ko+FS1uarpu3DKIpsxInMJaAStXky48l3JhXa/3GoJub68HTv79Cm5TW+8lLD4KMN1a3yIsE04+9EtlUZ/TwXkH+mS5qUbTVrSLSkiOkTcLSJsgPJvh7bqWMomBGIxD3jQ4m7gmnOdJMMaBE5xZlbEt+/4/qz3MyxWDA7QJ7stDkkmgqO87rf6SqRl/6rLU2YdzPkXhEm8TwXffqfKD55c5TcJdgwyovgh5JvVgmF9TDvaqAeyAHUsJ4n8LezQyWk9yNhQSe/9rgJkY7fggXd+qzGluxPhLHR9ZKqV+htp6B9u+zVXSV1clwX9/zawkqosve8aZwMBMorGiMyaneVSqp2wnaVwshMzI0j851iraz7OkZMRl5ivtam/7jvjHV3rkF8zsFc6ykvMjYfTHl6qFwtOA2S+//A2ORAfqC6m9JJwlZlbWWfe/yGMvwBPsnMxS7S7MYOcYvmH4stzIVe3NNC9s6SBNdtFve0mcYQsOzTKy5nTGSFUULiLZAmOvwT8lf7fhSHxw0FMZcXpRee7KL0tV00VivgkShQKl5Xqpp3jeWmgsJ7F6EJ6O3MlU5XtCXebNtHau+vQll0bMwPdZHXr90KF+AFeAnkluFH7z7iaeFUy4lS1QFRrhbFvbVn/mW6NaC0vhN55vpjw9Kf89JmQWZ+W0duUZiB7e93DLdcK9xwf1jRn7vdKnwVFHZGEGTGCsDc3RwrW3yOwLKmvp1dgwCXpQr51g7+7xhsby+R3RSYXUYfqFjvbNawPfOxDfWIBSwdyxufGE/KkSooTqzjwxQBZvvjBoIe+eH88haI5zPhCuCz3Lq4qsmooJht7ySdjR0SZjyhNjTxd1dEZPhF/P10+jT44rey5iSviSM527SZTNERWq58KLkBsWDy3Qlnt4PuaBUYV8P0F+uBQiUkghiuk1+NHWMEJ2fCibsA3upXvOr0yoaFnUVXmOrHyoajBfS50nzJGdwXxpwCNoKBUkQ5i/j5BtBRQ8WuHHFRJNz4AOtMyP4VJ+5WMTNemnU7Pdp6KaMNv7BqaRxE4G8uOJxlv+g51egmkPn75CweSWflwDHUKqO4ZcxLvQilbIxLlh35bf6B3OLMOqurpPC/Anxdsf/DsLMwrQjVVrek8iY1y2GPxSCWpZiAXGFbUguf+ZLjUnNEpeCLn0WiYUN2NHdw/L09CpxIGLv5y4y8ksF0/YjX4cxi0r6qGBjApBzFracDfPUaS1hTi9nCK42ZS5evb8ILfUrU4lBW2TkPeqDiqndixLJ4+YsiqxJIhByw1wYho9n6C8kYZ5wm22XDQe37p2yUILgj9VT+4sWADKCJPnFoO8s500ntGWEAYeXYfrbAr2AEf89vLU3FbCaDAnI/7aEiva8PSOsea5aCAxtAhlElho+JLXJp6zJC54K1Q3QC7Mv8HOdrgtUnfInyIFTgGtZpFcZZAqHAKWcYTuEGOl0GA6o78qiqO7wK6DJ5Coitk4kiTD4NrIeI9dLPQjkt2ZRySghVkxdI8XPbAJ3rbtECkWZd3cKWHJptmyXia/m12anKwV4Vl0zTdeZ4DxeFqhIT6rl//8na8C4HtJgXDlO1lioAFmKuvUsX7XA4c0izOjq9NVuGnLat36nCkEQaFkNbbhHU1Ljn2mFzTysy6JdEFxEDThI2uIzHgnjbBNIb6gh8uNiAgcKTLgpDlY6j2UVjVj+cj5IXA9I+PoQdt5O79tt3JAFdv3o4mX8BR+HyjiwUiIoEL0bymmfHkZVQGCMEc4gyX4mOHOJFl04DAxA5xLjcX6PV35dYe8BXFEkKgWq4ch+6avFvl49VnMc9F2kcCyS/YxCkpmQ+jvLWuFpKh1giQ8EvdEel2xI9ctqyjJeIlkpVBrMB20hSBhosfV6hFB+UMLMR0yUesCZ5iajZWOF3dP9LeNCt2u3Pl+HwbrJNe67ug5HiljaYFzFg/dMKcPoxhXHh+bzeku5Dh3iN94ExCDMlcUtLE9jk62nq5M1WNYY9W78U2P+aIvSpCWLSR6Z1zgLvvbVY9am2rMytEb2YB6fadL8V0vZi3CKkJ9T4JgYDFiuAiPjBM+xTL4SWCjTpVmPpsLw+Lp6rk3bLL9M39V0Q5KxSw+bYS/1wV66KMHwV/FLL1++SDJlD9Gx3Nniq+qZKnGXEC5Ef/u1Gr9tlk+1pxxAkmbvSKRACB4f5FyRIjYKlomYrzvh5E0S2C/VwyS3Gef1gHMTuYv3Rk61P8dszatersgzqTlISYcdU/4McVIoGFm6rRKWd+BuokD8yAoasaF/98POuAQLe2GVeOk8dP0oKu6iMOl5Qwr+xPrF2JNUriGD8OH6Hrts4n8v0Hmn2fpwShumAX7fouxvB7ormc2D5QTxKhia6ZDmvp04Mmkzh3ctFxj8NUAhNVAM6mlD4+r39wvdM1RdjOL/5b4KlWyzVhhbl5Mhljrnrb6Ecm8Byzzx50GUhXfbn52TXmqGbDgHJeyF5FAOv9xgrp6CIb0UWwcNkxcFt8oKbfjr1RKYNQQKnt1LkQzpjaMbkD++fAf86JoYChJaoXMkmAPeXJjPuKu6fU5RdnxXIGHcjXvGT/50NQ6geMM8Ov12Xt93CtKxt/MSPvWj1uKNM/U50Ix/f1g11V7fZoRMWs59inpYSA4yf7DsFZSr1qXDHek0UDN444gcUu058ulgDSP4zyKuqgAv2xRET1/ldx0ZPBVgXd78o/j7/W0r3RPClgTWlMPlsge5gnHC+sRQakM8oT7PzY88Z55WRRafVkby44QEBPSzUISg1xzEuhKOBd0WxhB4d4Hehx5aFUPCk/qD1bnokM0UmDYKpyK9/RQpJBcElIb0cN9iKvZPpV+UuYvTOLGxgym2Lh+j0OSE0eonXbhCsiUBA5A4GDeMDG4qu+k8QeKPGgGPvRmU2oXHvFVkwzbcu6OJQfukwWuhq1Z4ycLUo+ldRzLW0rXJrLKB6iK3zdendIO7rP+rMk6Wx6JfhJqIorTmb9kLbLgNsAOfWS36G7+qAuZYdz8jFLIMMe4zuZUmoIIUYGcZDXoe+oHcw5/BklZ5pVTtd60+BKSGZHbGswHCkIeLA7EA6TGXD7lOhCpOFQhaHEbL+ETSoQD32TPnVrOFPXrBt+JYNAbA6bDvP/KoZTvJojsr+Qibs6wEr/UZDK5EmLUvs/DcgV27y8k9rx1WNyfwtssrB6hDkRFjUT8d7hlOnwsxjGYdhQDWevuJr7IucsM3hD4rQDOT8XhdmYK+duFRXQXEtvB9VqX5urA7QTVajEql8YCfzeiHEUFMjf8ELbQhsRzS3XemQbVG1QLduPOnWO4bNS9xecryZQk5QOCQeZK0VInueuXv1jTw2QDCqh8khS1CI+QfzhTLZ+x/WBf7Ao1otnfiMB6SvqB34l4l2PucdNtFzA7AOg5jgb5BsFgYTNJ3lm8lb1PCQLQyBC1JtTx82Ql4VRHi7SrmJ5WkGzvnGbIzNIvavO3lltkTe3Y3sBXeC53SB96WHmDvhKZeDijiL3odRshKWADHYUGAnmzVFl2OuLfj3Rvz8XApKd8JyhS8IgA0YOkWaZn1Lur2Asoiod7riHRmD4xbR9uTME5eHVh+ngEuvkyHctIvwiviPrsP38aBmzHYEm1JOrUKqtfW4Kv3Ah/5jYSLG0Ny/Dtp6vBiuFTItu3y4orxSfgFbH470/WY5+RRMbPsy0vb09P3UcWkIgo2b9djffoPjo0ruh1CYbh1ZA9Is0h3v7Zk5+XmKpdCW6LOsdYe+S18Eves5bDdvGlAhPBPAsg+nwm+zfD6QwL5HZrcR7rVFh48L+DT7uzXVMpm7cg8rVZ6wm8BziP1dkMSPwLozhIJvvVOjydlF/xpetzo7oVpn5LqAfJSUTTmazFEvxKfxI61MTQQazWPv8surrzpK/4oAiUTju/RC1iXYmOhc3mA/Nc3ifYsmqMvhkCfiTbi1l/+JajJC6R8WV0doIJIbFwcwzqZRJANdZvlj0gGUO32WWdafNNMWZzoLiHoUSDAoGZa+h4iOqYWerB1T4t/yVUMTzjuiBb2Pg7OeMQEr5vtacayrKqTX3gINZx4jYFpFc+0snXBaZopWpfYp/FsnY5ack0e44JGRljWjFxnqO4dro9xxCiGf3KP5lI+Uwmq/LSDTFbbXyHznq8DnoEflJ1eO3mVYn+Ugj/gunY4Vq8A8u8dkFFa0Or2ctsTu/korp/gaDckvuGEJNN+BenAWHC3wz7DoH9mTkl6gR2PgDaPOhw1rnBc6a+u6jwEN+UdDsnMCzI4Gd+hpcIJqhldqgKUX7Y8N8+YskamUPwSUcsVbKsA4EeccA6unFX9o7jDhlgXndC8rK6Y9EowpzCzEPdEvTygeFH+EsmGVUdsKAFUs97SSgorCMrXE8qcYujbglws2oC66ulZZXS7Mk+E9EyBsrrHu0g5+9c2wNBROloB32gR5UAteNiQHFspbFGGSjE+SMseTPvvnfLdcEw+laJQkcd9c+xwxu1gdmYPX8dPwk0x0Fwanite0h4kee5ypuIDKXKs/b3ktodj/Ff17yTJmFnkNzTluoGM6a8WyPMBwMCLkRf/LQvsn5ND28i27sowJgQeeVnCgIwJ2v3NoLrUtUsfR0zy0MkD6Sm6vCWvVRw6BtoEc05oOleiAxa/UQ9m0A/K7DHOugCRLwDKs+6UtVAR32/JD2xKSZhXlJU2lejPzr/F9aOe5oD/NMCOPF+KCphqNIX+GHPF4118//Gbt6hFovVF/NxxoCAnFJdj/tFunvYdXRWuQlMXr3bYroXieKyTGRS2u7iesSL1LILgh8njI89wlAvDs0ZTfdOWhtZOI9gvd6LRdqKXAp+QXNgw/W9uwPI3eQGZsThtQg32ixXxMWsekA/QBpATjsl/EmCxlfaeTnGXH/rGmwpEMJ3U5ha3oy6kL0n2e0qOFVVxOyVNoeviWoieFy9nT6M+AkslShqNp8wZBeceIVH2XO5M1Zq8JlchB+pH5I/iqdk1P1GnmKN7l93jjxQx9tXFMosVJvuALD0IKxGjvv1spgTnoa7I/y6JnBCS7J8QjgSK5hACztUp7TFGAq4UXXVcX8as6e1fHXFVH7jXgG7WTvBffXOCpsaErQMJO3cflx3Azccf1wRsabVA+TX8qJmmj4wYaB/tYk3Oa0c0f0F5kfB+ZBG4RyfWL863QP7DH/yH3MKrKUy30jYqN0EeZvwNpf+AUVWAd2FN5gRpu1LHcmlPGKpxpjh+vEqnDV5EID9W+ntqITx4lGjXqWD3MSnVUlbQQI3bd9lbZhaH2b4cKdjiS9sBfAQbyNRVojm6/7azwaC3fUeK8g2pPZrCQY3UeIGpmKp/WfOgUAdLpdk/OJ461Zrgrg0HPR0hqT9J6nDCxLVU5KN9+J9JpkKcpCYaAiZslUgbl71zXrDH9tYJyP1yiV3uH01xe4Tytz1tBPq8Bgl373l/J/uT2fQ3fVxKUZqxJK4GvuOMBT2TzvrBwdqIFhsTXxltSwj031UJk9S51ZT292Ga7+/3z80ulobrILB8zPmIhk70QoBVni5RlhFn8BcWrWRcq0HSICmb36rVu5p34MuIdOYYXcWNVIK0ZFdLMEDBn3cUs+RMNEBSswqDY7YwL+8ljplG1l1cUaFXEVTIx7q5lVRz4TkIzSQbO9H15IfjkuTF5NBghg3xQbbIlqIM7QnUEzOFkIwW+TYvFWfYGRoy6+wpGQQ2vpR5dBKgz+m8/5XRaGAAHBif0wosnV/vCVA5nTdWFR0wAFZ7WMY7Q5BMON3jEpRwJw07hC5ZTja+4HTCM1E3VwSVAV2+iCTwqzTKYyN13eC1BOw7/yxC+tKPJ/XsBcRsiaTtyQXJVKVe+94FxpNNOfHk7E3wouhwePIvqbGMNqq8/ZxX+W4m0xIOzI9DWEVhBLAubaCpNuVwmJ458yvIAk9whyWSde2yOe+JDXq/CEbh4Da8DnCviFnQhcIb3h0jtQoB7ji+1B4KfctpOL9n0VE275F9ziRQdnZzQhzgHaNVvSTx6GpOd3BI6Pk1kkRDpgjs2K5ct8mT/KQAnxeeVPOi7nWYmCeXIuqNe6nWD3fKozRr1Izl4FnyBmEZcw+GO9Af7J1wrjvpRXKZ68f+Ky5BQHeDOOo2GAf/ZS1RIB1jh65WBRoxl2ZWfXiX79U4AEUPQYw3wKqF6fwCl9fZ88HYT7wW6nHfb4uHYkLbfkDVFsZ9p7DRVIedJLt8Q681kH21NfqIZor4U4qmImIT1kKqaJ189MXLAt+8QR/4tWCQRDdncstKLRKstY6CRAGxq7UuzBgRPjKLjFfA/5uY/t0KEO3NwhQSY8pEdbfcmFVfGKLUuglNM0hg+lBjkNM1Mvs/0vZBco7nA0dXtq/pBVuySz5HXbxlSKM8C6AaualNag2ZIkPGvzKMJt9JZ8TTbeGP2mrwOGa7WZr54B2OVm0MHDb16ITZBX7sRaNeRbY0TLo+L7To8kpVKqcrERZnS69TQsMlRzgyU/n107rmx66Wf/THyXDuUruQLgo5JyPRxqOP/XIrAYu8SRATVenRMK2YwqQ+qZK9HAJ8RZABhNSBo/JKlOUFZ4csDdOwbDS88V6fxFlbGVaqwWbj6uo335MOkqa3UZKkHUbbyNIxmGt2Fu9+Gn6qr2lAfpAZiLXlq5wQZW3rLee4ToOMyWP4aivEaZmTseHr8EpgVr57lkk3flwj+0LX8jfYugrJecaZUyHynn9tOWDjyqHwnXH7yO57SmEzrdpLACiwfz0xM8eFZ9xR0P21eTcIs58uc4tm8ahmCljrPxRd4R48OT8GcyUqugidR/8Fld64jDdqK1nooquqc6uWpCUtGNtzwqdRT7RXU2+ev2XmotQS36n+hQlUqPcyha2F8/10gMGg1tU6sYslVxIC6VGkNOjusjvsPzMAODgKbnvN8WD1GZj5B+OZEpMMwiyXP9DIP1NcZDFnoYOnkFTsOJ5fdojMHvc6zcq1Ej1SbQZb4J99WIVaH2H4u2tBEvJdSao/FvWEBMiVQpeLneU/O3kwHx2yWMwfUa0vj5HKERam+JQH8k+1PvKhDNmB6IMGAQtBHsBd6LTVunaq9DBNXL3w1L3JI7Mn+eia3oEdG5wtOr6QEyN1VqJN7NO98QrBH9+dZsHdbXLK7cIN5iUS2wgmk1L32+E+c/L8GXtD5yKtCWF6Xb0sJcpiwc00LK3TZT4OpwF+611MaECw251DBw61d351YKIOKv7xH2vPxWNj6WT/nZAdjKRHTgKuW1pZoVTk1Qk78LSi0+kjwI6TKyD5c6ca6BhIkYHJBUf9qZYqm9YCXARSrRW75oHcQB1iSpcdmdm3B8Wc3Vwlt/3yqSqqnAzvCzhhqkutnzg82ff33o7wEodYbogLOM+trHHn0DrM8eWP2VxxIpHnZ1Rwk+m/hx4/tRB5SbvVG0hefTMAhjkxg776BgN2ZhCEqiCXyRydh/0YeEqlPNZL5bqSiEiftFbROxqMUyfJC7z4xo0jW1A3myzaVqk+D4eHeTbcwPrtWCCB4j5dVX0rr4MrY9TzzmAXw41SSyJCJ9UppKZF1cvoacu7VeCyM7lGlTHvyTPsj3sh58f2sEFqRbFK9UrCyy+23fOftfy4kn81F/W+zChNxzJ7Jlp28VpVmE2aO6oLxRqDL4YSIbkaDQnpw1fUdFfU2enTlat+S6s1yAS7SP6ElInaPy4DFBw7CsLjJAQxS3kEBJNJ7L9ywvvMhdppRwf7yILfWNPIaKF6pwOMJ6Ab0C5xyeconaBEAKNdistzwSHvE0IDUySZ3xxWBVE/5eK6eDjOfmn1jvHtMN/nvUHThv5gLjfgJkQ0H4M8fOCSXHZdvjjCZCFT9lQAArWYlHj+DnOjGPiu9rgSfw7kw7ObpfBPAIjpwFkV9LM3hNGPJxztdQ3pJrv/bi10HFEC8vSEs/+RZZve4gqo4VddlLfqDEC//DMBauFpZtyoDWUklXKVakXvOxcovIJwJ8tqJ/dCnthni6tzzpR6m4WXM4zY+0/GWSy5vShT0HDhlmArQNbM6I/HCAH47LZxYqy51RKZSZFxGsG+UmcAcsUnTu+e7hf9d0nBmejto+JpLDtpeAut40ptEjQlXzUx4a8AZRSwTSfCErmRBuInMcKfql53M+f8rlcqlAfEZcaQ7sRE2CpNy1lZD3+Z3WFysWdCWju79p7Ey55IuWpmhZack/Sh7BuTtSA9lF5/l/y2T/wj9Cw+zvn1Z7swd4J0A3xFnss9mG9HwYZIQH8g1/4wjryf+e1MrCG/PUlu1H0ZiY84JV/wI3nX4fdD00oO+XIjkKck6B48WHSzUt2+KfA5N6z4ZZful1q0/KJVrUxRHxdJThyU42tjf7zwi020hThOe9GjbZrxA1hCMYgx99AWF8P4FVDOAF8UalOlId02yD9c+GIzdNANU2NuVxFYWzYzT/OcgdE7sws4T+L+vDbv6KQ1/JBEHV359INSLCWEswHYdjlvWQWIursMpzZeTW48ILTIV7M7rMjvyG2Ti0k3/ISCsf38fd/4eU9JR+bG70FPF59aZ3SYOzobiOSPAYJMnEFehE0/YAxfJe2XCofJsAYYMAsSE8+yHv3DNsOXFB1H7NEB9d6fMfF+SGlbOtf099awGOjwtNTcmXucjUagOvJX7lEyZiX6uJqvn+tOjQvMoH4YRbPHdXP75a8VBB1Bw/KE12TQQZP2xhHXGkjH5+JCONAOd0TCm7FJWeUGG0et4DwW6JrT5XUVLaHUHCkohdWlV/5wlpDTtjixRc+9zkpIJtRs8pCNNsWscElCswgZDSq10iXzmSe5In8KUt8D1kZ091XgSXKmBemX9oJDS+SIsSSZ6vDvV9WP42mNwaP3UKUDDMesJolmaTysXGAJJRjFL8yd79k/mOcoyIJL9HIoYrjau4C1Vjz17LTeO5NyglDVrbsHy6F4VLOx/YQw4Bg7WmQfvepkE7Vvuh6W3AscBucY+69SxwbJ9rTOSYVCmupAXSki0coNxvCa2sfi73UR7mHASeCkNsdZ35ubpGuVKEo2gZkYDxUG6LZUk+23EYnzd3z2KYxa6VXdmwdNQlDBdnSpUAaQkdJdAXhNnv7TDWMFEXSh9EATRYmHnRiPSkEK03khZseKAWZm7m5lPB4lBz0sQ9ZA8ZE8k5WJ+zHg9I/c4iqxxADNzNIvZiy5RKFfuvAx7WtzxpGb7CU9K/6Fe4vYfxKOnH5bdFVt2aMFt5ZOiMT2oxpgxA1iwcRED0a5Jn0fkb1Tq4h/+PwKTElRqOxaSyu78xeF/TE+K/S5Hi0DB28QeCbPxUEQbJ9HlsPHtNSjUUX5/iL0x0xujcQ9z8ya42m+156I/eCP0vHGjrniWCISwftzlBG/tq6rdGQD9xta65PV1vY9xCr+ZKPOsepZeqsboaAq2w80rO4xUIYHfgiYKvqjeldH0/bokAeQgZxeFeftpkZpJH53wtRgLr6dxBYfCwNpiX2YMNXHRbvRah44RI7sxVH9e0g7MIntZ8zQjDg9Kq7EkLRncWD+4q19SFq9SRDiNiYzIR+FqPlb0woPQBu0YW3hZfUCmeHhX/sfjvF9xVMecGxkMC7bUivdLJ+um7ttCoYwLevXufGkRt0d8Z6kPmmQq3VUEwzm8bh6vD+hH6tgFKXfKvXLbw06ccQQ2F2K/Y6TfScoFPNvzZC4fqBTjH5Yw1P6ZMnwf6Wo/7HGq+rbpeFsgAGENQGGMaeU98HMon4v4sLLQ8naWfApr+lfCLXfqvJ1nGaBf+YXdlcwC+jrbRN+xyEgWh8DRCKfsD986u9j0cIrbB5c+xMVm2N0w37RW4aeWaA1kMRvLk3jIn+pc1ox/zBiqmf7huuAU7WgbGnCNPU3ACK4Beo+a29xjSVzgSwOMN6MNcrihk8fn/qPblyVAuugTARx0edquyuXdbJiSq23Wq3td+S6H9DE7JHBLdweojIpQrjAMfe8J8KpJM9RsRGf3hP7vwzaEcTgd7N2PblnNsISBwSlZJUj+ZYcxqy8AUrRpcYxMScRjQM0/SzUL6MTwLqoVH3RbRhU2Q3PYi1wcnRaUwdrJ1idf8VmLVGJ15FV/43Uebj4tfGl2N9QHnRfp000CFUMUzILZvW0skj68llDHvTGN73he2R4d+nROy2kajWO/oeP6C6Az1aJfUOglrnAhxpnt5LlVOA6l2E5omgyyqBAhCAEEofFcpqw5w9/XTRX6hu5aLa5NB7dM2qX/kPmAy4BqHxTazxgTctnCd9THOTiqESIEXd2v+UdAV0QY5TqNML1TzaKPow7dwGAFSLNX4nRsMe6h01YrM/swh0wni+MLuviPeQ2hQWDyNPCnN/Yikzr47aIM7Bua0P79loY4DZtkdz4Pez+tsjtGRd9Cn/cCg8C5zGPIwKrL1In8xwiEA9ZB0vQ9XMNqnHJCls+vuhmm7ZEanfFCB++Z8RFva+ZaY8w/iRatlwKSOJ3yH0xBUJIIpKTp1GwRKK1KwdT6w1KVDXp8uC2dZKnWcGjczF1v8mQiIJMFG/GCsWTA3lUhCKMmSBK32E6Qksq+7nJIo="};

  // Pure JS SHA-256 & HMAC-SHA256 & PBKDF2-SHA256 (works in all contexts including offline & HTTP/HTTPS)
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  function rotr(x, n) {
    return (x >>> n) | (x << (32 - n));
  }

  function sha256(msgBytes) {
    const ml = msgBytes.length;
    const bitLenHi = Math.floor((ml * 8) / 0x100000000);
    const bitLenLo = (ml * 8) >>> 0;
    const padLen = ((ml + 9 + 63) & ~63);
    const buf = new Uint8Array(padLen);
    buf.set(msgBytes, 0);
    buf[ml] = 0x80;
    const view = new DataView(buf.buffer);
    view.setUint32(padLen - 8, bitLenHi, false);
    view.setUint32(padLen - 4, bitLenLo, false);

    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    const w = new Uint32Array(64);

    for (let off = 0; off < padLen; off += 64) {
      for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4, false);
      for (let i = 16; i < 64; i++) {
        const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      for (let i = 0; i < 64; i++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + temp1) >>> 0;
        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
      }
      h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
    }

    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    outView.setUint32(0, h0, false); outView.setUint32(4, h1, false);
    outView.setUint32(8, h2, false); outView.setUint32(12, h3, false);
    outView.setUint32(16, h4, false); outView.setUint32(20, h5, false);
    outView.setUint32(24, h6, false); outView.setUint32(28, h7, false);
    return out;
  }

  function hmacSha256(keyBytes, dataBytes) {
    let k = keyBytes;
    if (k.length > 64) k = sha256(k);
    const ipad = new Uint8Array(64);
    const opad = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      const b = i < k.length ? k[i] : 0;
      ipad[i] = b ^ 0x36;
      opad[i] = b ^ 0x5c;
    }
    const innerInput = new Uint8Array(64 + dataBytes.length);
    innerInput.set(ipad, 0);
    innerInput.set(dataBytes, 64);
    const innerHash = sha256(innerInput);

    const outerInput = new Uint8Array(64 + 32);
    outerInput.set(opad, 0);
    outerInput.set(innerHash, 64);
    return sha256(outerInput);
  }

  function pbkdf2Sha256(passBytes, saltBytes, iterations, dkLen) {
    const blocks = Math.ceil(dkLen / 32);
    const out = new Uint8Array(blocks * 32);
    for (let b = 1; b <= blocks; b++) {
      const saltBlock = new Uint8Array(saltBytes.length + 4);
      saltBlock.set(saltBytes, 0);
      saltBlock[saltBytes.length] = (b >>> 24) & 0xff;
      saltBlock[saltBytes.length + 1] = (b >>> 16) & 0xff;
      saltBlock[saltBytes.length + 2] = (b >>> 8) & 0xff;
      saltBlock[saltBytes.length + 3] = b & 0xff;

      let u = hmacSha256(passBytes, saltBlock);
      const t = new Uint8Array(u);
      for (let i = 1; i < iterations; i++) {
        u = hmacSha256(passBytes, u);
        for (let j = 0; j < 32; j++) t[j] ^= u[j];
      }
      out.set(t, (b - 1) * 32);
    }
    return out.slice(0, dkLen);
  }

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  function bytesToB64(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function xorKeystream(dataBytes, encKey, ivBytes) {
    const out = new Uint8Array(dataBytes.length);
    const blockCount = Math.ceil(dataBytes.length / 32);
    for (let ctr = 0; ctr < blockCount; ctr++) {
      const msg = new Uint8Array(ivBytes.length + 4);
      msg.set(ivBytes, 0);
      msg[ivBytes.length] = (ctr >>> 24) & 0xff;
      msg[ivBytes.length + 1] = (ctr >>> 16) & 0xff;
      msg[ivBytes.length + 2] = (ctr >>> 8) & 0xff;
      msg[ivBytes.length + 3] = ctr & 0xff;
      const ks = hmacSha256(encKey, msg);
      const start = ctr * 32;
      const end = Math.min(start + 32, dataBytes.length);
      for (let i = start; i < end; i++) {
        out[i] = dataBytes[i] ^ ks[i - start];
      }
    }
    return out;
  }

  function decryptVault(passphrase, customBlob) {
    const blob = customBlob || DEFAULT_ENCRYPTED_VAULT;
    const salt = b64ToBytes(blob.salt);
    const iv = b64ToBytes(blob.iv);
    const expectedTag = b64ToBytes(blob.tag);
    const ct = b64ToBytes(blob.ct);
    const passBytes = new TextEncoder().encode(passphrase);
    const dk = pbkdf2Sha256(passBytes, salt, blob.iter || 25000, 64);
    const encKey = dk.slice(0, 32);
    const macKey = dk.slice(32, 64);

    const macInput = new Uint8Array(salt.length + iv.length + ct.length);
    macInput.set(salt, 0);
    macInput.set(iv, salt.length);
    macInput.set(ct, salt.length + iv.length);
    const actualTag = hmacSha256(macKey, macInput);

    let diff = 0;
    for (let i = 0; i < 32; i++) diff |= actualTag[i] ^ expectedTag[i];
    if (diff !== 0) {
      throw new Error("Invalid passcode — could not unlock vault.");
    }

    const ptBytes = xorKeystream(ct, encKey, iv);
    const jsonStr = new TextDecoder().decode(ptBytes);
    return JSON.parse(jsonStr);
  }

  function encryptVault(stateObj, passphrase) {
    const salt = new Uint8Array(16);
    const iv = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(salt);
      crypto.getRandomValues(iv);
    }
    const passBytes = new TextEncoder().encode(passphrase);
    const dk = pbkdf2Sha256(passBytes, salt, 25000, 64);
    const encKey = dk.slice(0, 32);
    const macKey = dk.slice(32, 64);

    const ptBytes = new TextEncoder().encode(JSON.stringify(stateObj));
    const ct = xorKeystream(ptBytes, encKey, iv);

    const macInput = new Uint8Array(salt.length + iv.length + ct.length);
    macInput.set(salt, 0);
    macInput.set(iv, salt.length);
    macInput.set(ct, salt.length + iv.length);
    const tag = hmacSha256(macKey, macInput);

    return {
      v: 1,
      iter: 25000,
      salt: bytesToB64(salt),
      iv: bytesToB64(iv),
      tag: bytesToB64(tag),
      ct: bytesToB64(ct)
    };
  }

  global.RadiusVault = {
    decryptVault,
    encryptVault
  };
})(typeof window !== "undefined" ? window : globalThis);
