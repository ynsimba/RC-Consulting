<?php

namespace Database\Seeders;

use App\Models\AvailabilityWindow;
use App\Models\Faq;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        if (is_string($email) && $email !== '' && is_string($password) && $password !== '') {
            User::query()->firstOrCreate(
                ['email' => $email],
                [
                    'name' => 'RC Consulting',
                    'password' => $password,
                    'role' => 'super_admin',
                ],
            );
        }

        Setting::query()->updateOrCreate(
            ['id' => 1],
            [
                'allowed_durations' => [30, 60],
                'timezone' => 'Europe/Brussels',
            ],
        );

        foreach (range(1, 5) as $day) {
            AvailabilityWindow::query()->updateOrCreate(
                [
                    'day_of_week' => $day,
                    'start_time' => '09:30:00',
                    'end_time' => '18:30:00',
                ],
                ['is_active' => true],
            );
        }

        $faqs = [
            [
                'question' => 'Dans quels pays intervenez-vous ?',
                'answer' => "RC Consulting exerce ses activités principalement en Belgique et en République démocratique du Congo.\n\nPour d'autres litiges internationaux, n'hésitez pas à nous contacter pour une solution sur mesure.",
                'question_en' => 'In which countries do you operate?',
                'answer_en' => "RC Consulting operates primarily in Belgium and in the Democratic Republic of the Congo.\n\nFor other international disputes, please contact us for a tailored solution.",
                'sort_order' => 1,
            ],
            [
                'question' => 'Quels droits pratiquez-vous ?',
                'answer' => "RC Consulting pratique le droit belge et le droit OHADA.\n\nPour d'autres litiges concernant le droit congolais ou d'autres droits nationaux, n'hésitez pas à nous contacter.",
                'question_en' => 'Which areas of law do you practise?',
                'answer_en' => "RC Consulting practises Belgian law and OHADA law.\n\nFor other disputes involving Congolese law or other national laws, please contact us.",
                'sort_order' => 2,
            ],
            [
                'question' => "Proposez-vous la médiation et l'arbitrage ?",
                'answer' => "Me Charlotte Richard intervient en tant que Médiateur et Arbitre dans vos litiges civils et commerciaux.\n\nLa négociation et la rédaction d'accords ou de clauses compromissoires fait partie de nos services.\n\nNous intervenons également pour l'homologation de vos accords de médiation ou l'exéquatur de vos sentences arbitrales.",
                'question_en' => 'Do you offer mediation and arbitration?',
                'answer_en' => "Me Charlotte Richard acts as Mediator and Arbitrator in your civil and commercial disputes.\n\nNegotiating and drafting agreements or arbitration clauses is part of our services.\n\nWe also act for the homologation of your mediation agreements or the enforcement of your arbitral awards.",
                'sort_order' => 3,
            ],
            [
                'question' => 'Accompagnez-vous les entrepreneurs et investisseurs ?',
                'answer' => "RC Consulting accompagne tant les particuliers que les investisseurs et entrepreneurs.\n\nNous offrons aux professionnels une prise en charge globale depuis l'élaboration des projets jusqu'à leur concrétisation, du point de vue juridique mais aussi institutionnel et pratique.",
                'question_en' => 'Do you support entrepreneurs and investors?',
                'answer_en' => "RC Consulting supports individuals as well as investors and entrepreneurs.\n\nWe offer professionals comprehensive support from the design of projects through to their completion, from a legal standpoint as well as an institutional and practical one.",
                'sort_order' => 4,
            ],
            [
                'question' => 'Conseillez-vous les autorités publiques ?',
                'answer' => "RC Consulting intervient comme consultant pour les autorités publiques en Belgique et en République démocratique du Congo dans le cadre de la gestion de projets institutionnels et de l'amélioration des politiques publiques.",
                'question_en' => 'Do you advise public authorities?',
                'answer_en' => 'RC Consulting acts as a consultant for public authorities in Belgium and the Democratic Republic of the Congo in the management of institutional projects and the improvement of public policies.',
                'sort_order' => 5,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::query()->updateOrCreate(
                ['question' => $faq['question']],
                [...$faq, 'published' => true],
            );
        }
    }
}
