import { trigger, transition, style, query, animate } from '@angular/animations';

export const routeAnimations = trigger('routeAnimations', [
    transition('* <=> *', [
        query(
            ':enter',
            [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ],
            { optional: true }
        ),
    ]),
]);
