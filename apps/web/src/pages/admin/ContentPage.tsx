import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  createCategory,
  deleteArticle,
  deleteCategory,
  deleteFaq,
  fetchAdminArticles,
  fetchAdminCategories,
  fetchAdminFaqs,
  saveArticle,
  saveFaq,
  type ArticleItem,
  type FaqItem,
} from "@/lib/admin";
import { Icon, PageHeader } from "@/components/admin/ui";

type Tab = "faq" | "articles";

const emptyFaq = {
  question: "",
  answer: "",
  question_en: "",
  answer_en: "",
  sort_order: 0,
  published: true,
};

const emptyArticle = {
  title: "",
  excerpt: "",
  content: "",
  published: false,
  category_id: "",
  seo_title: "",
  seo_description: "",
};

export default function ContentPage() {
  const { isSuperAdmin, isLoading } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("faq");
  const [error, setError] = useState("");
  const [faqForm, setFaqForm] = useState(emptyFaq);
  const [faqId, setFaqId] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState(emptyArticle);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  const faqs = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: fetchAdminFaqs,
    enabled: isSuperAdmin,
  });
  const articles = useQuery({
    queryKey: ["admin-articles"],
    queryFn: fetchAdminArticles,
    enabled: isSuperAdmin,
  });
  const categories = useQuery({
    queryKey: ["admin-categories"],
    queryFn: fetchAdminCategories,
    enabled: isSuperAdmin,
  });

  const saveFaqMutation = useMutation({
    mutationFn: () =>
      saveFaq(
        {
          ...faqForm,
          question_en: faqForm.question_en || null,
          answer_en: faqForm.answer_en || null,
        },
        faqId ?? undefined,
      ),
    onSuccess: () => {
      setFaqForm(emptyFaq);
      setFaqId(null);
      setError("");
      void qc.invalidateQueries({ queryKey: ["admin-faqs"] });
      void qc.invalidateQueries({ queryKey: ["faq"] });
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible"),
  });

  const saveArticleMutation = useMutation({
    mutationFn: () =>
      saveArticle(
        {
          title: articleForm.title,
          excerpt: articleForm.excerpt,
          content: articleForm.content,
          published: articleForm.published,
          category_id: articleForm.category_id || null,
          seo_title: articleForm.seo_title || null,
          seo_description: articleForm.seo_description || null,
        },
        articleId ?? undefined,
      ),
    onSuccess: () => {
      setArticleForm(emptyArticle);
      setArticleId(null);
      setError("");
      void qc.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err) =>
      setError(err instanceof ApiError ? err.message : "Enregistrement impossible"),
  });

  if (isLoading) return null;
  if (!isSuperAdmin) return <Navigate to="/admin" replace />;

  function editFaq(row: FaqItem) {
    setFaqId(row.id);
    setFaqForm({
      question: row.question,
      answer: row.answer,
      question_en: row.question_en ?? "",
      answer_en: row.answer_en ?? "",
      sort_order: row.sort_order,
      published: row.published,
    });
    setTab("faq");
    setError("");
  }

  function editArticle(row: ArticleItem) {
    setArticleId(row.id);
    setArticleForm({
      title: row.title,
      excerpt: row.excerpt,
      content: row.content,
      published: row.published,
      category_id: row.category_id ?? "",
      seo_title: row.seo_title ?? "",
      seo_description: row.seo_description ?? "",
    });
    setTab("articles");
    setError("");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="Super admin"
        title="Contenus"
        description="FAQ publiée sur le site, et articles du blog."
      />

      <div className="flex gap-2">
        {(["faq", "articles"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "adm-btn-primary" : "adm-btn"}
            onClick={() => setTab(key)}
          >
            {key === "faq" ? "FAQ" : "Articles"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {tab === "faq" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            className="adm-card space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              saveFaqMutation.mutate();
            }}
          >
            <input required className="adm-input" placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} />
            <textarea required rows={5} className="adm-input" placeholder="Réponse" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} />
            <input className="adm-input" placeholder="Question (anglais)" value={faqForm.question_en} onChange={(e) => setFaqForm({ ...faqForm, question_en: e.target.value })} />
            <textarea rows={4} className="adm-input" placeholder="Réponse (anglais)" value={faqForm.answer_en} onChange={(e) => setFaqForm({ ...faqForm, answer_en: e.target.value })} />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={faqForm.published} onChange={(e) => setFaqForm({ ...faqForm, published: e.target.checked })} />
              Publiée
            </label>
            <button type="submit" className="adm-btn-primary" disabled={saveFaqMutation.isPending}>
              {faqId ? "Mettre à jour" : "Ajouter la question"}
            </button>
          </form>
          <ul className="adm-card divide-y divide-line/70">
            {(faqs.data ?? []).map((row) => (
              <li key={row.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{row.question}</p>
                  <p className="text-xs text-muted">{row.published ? "Publiée" : "Masquée"}</p>
                </div>
                <button type="button" className="adm-btn-sm" onClick={() => editFaq(row)}>
                  <Icon name="edit" />
                </button>
                <button
                  type="button"
                  className="adm-btn-sm adm-btn-danger"
                  onClick={() => {
                    if (confirm("Supprimer cette question ?")) {
                      void deleteFaq(row.id).then(() => {
                        void qc.invalidateQueries({ queryKey: ["admin-faqs"] });
                        void qc.invalidateQueries({ queryKey: ["faq"] });
                      });
                    }
                  }}
                >
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-6">
          <form
            className="adm-card flex flex-col gap-2 p-5 sm:flex-row sm:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (!categoryName.trim()) return;
              void createCategory(categoryName.trim()).then(() => {
                setCategoryName("");
                void qc.invalidateQueries({ queryKey: ["admin-categories"] });
              });
            }}
          >
            <input className="adm-input flex-1" placeholder="Nouvelle catégorie" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            <button type="submit" className="adm-btn">Ajouter</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {(categories.data ?? []).map((category) => (
              <button
                key={category.id}
                type="button"
                className="adm-btn-sm"
                onClick={() => {
                  if (confirm(`Supprimer la catégorie ${category.name} ?`)) {
                    void deleteCategory(category.id).then(() =>
                      qc.invalidateQueries({ queryKey: ["admin-categories"] }),
                    );
                  }
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <form
              className="adm-card space-y-3 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                saveArticleMutation.mutate();
              }}
            >
              <input required className="adm-input" placeholder="Titre" value={articleForm.title} onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })} />
              <textarea required rows={2} className="adm-input" placeholder="Extrait" value={articleForm.excerpt} onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })} />
              <textarea required rows={8} className="adm-input" placeholder="Contenu" value={articleForm.content} onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })} />
              <select className="adm-input" value={articleForm.category_id} onChange={(e) => setArticleForm({ ...articleForm, category_id: e.target.value })}>
                <option value="">Sans catégorie</option>
                {(categories.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={articleForm.published} onChange={(e) => setArticleForm({ ...articleForm, published: e.target.checked })} />
                Publié
              </label>
              <button type="submit" className="adm-btn-primary" disabled={saveArticleMutation.isPending}>
                {articleId ? "Mettre à jour" : "Ajouter l'article"}
              </button>
            </form>
            <ul className="adm-card divide-y divide-line/70">
              {(articles.data ?? []).map((row) => (
                <li key={row.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{row.title}</p>
                    <p className="text-xs text-muted">{row.published ? "Publié" : "Brouillon"}</p>
                  </div>
                  <button type="button" className="adm-btn-sm" onClick={() => editArticle(row)}>
                    <Icon name="edit" />
                  </button>
                  <button
                    type="button"
                    className="adm-btn-sm adm-btn-danger"
                    onClick={() => {
                      if (confirm("Supprimer cet article ?")) {
                        void deleteArticle(row.id).then(() =>
                          qc.invalidateQueries({ queryKey: ["admin-articles"] }),
                        );
                      }
                    }}
                  >
                    <Icon name="trash" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
